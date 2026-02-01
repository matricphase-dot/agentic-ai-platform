"""
analytics.py - Product Analytics and Usage Tracking
Track user engagement, feature usage, and product metrics
"""
import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import hashlib

class ProductAnalytics:
    def __init__(self):
        self.db_path = "database/analytics.db"
        self.anonymous_id = self.get_anonymous_id()
        self.init_database()
    
    def get_anonymous_id(self) -> str:
        """Get or create anonymous user ID"""
        id_file = "database/analytics_user_id.txt"
        
        if os.path.exists(id_file):
            with open(id_file, "r") as f:
                return f.read().strip()
        else:
            import uuid
            anonymous_id = str(uuid.uuid4())
            os.makedirs("database", exist_ok=True)
            with open(id_file, "w") as f:
                f.write(anonymous_id)
            return anonymous_id
    
    def init_database(self):
        """Initialize analytics database"""
        os.makedirs("database", exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # User events table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                anonymous_id TEXT,
                session_id TEXT,
                event_type TEXT NOT NULL,
                event_data TEXT,
                page_url TEXT,
                user_agent TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Feature usage table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feature_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                anonymous_id TEXT,
                feature TEXT NOT NULL,
                usage_count INTEGER DEFAULT 0,
                total_duration INTEGER DEFAULT 0,
                last_used TIMESTAMP,
                first_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                anonymous_id TEXT,
                session_id TEXT UNIQUE,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                duration INTEGER DEFAULT 0,
                page_views INTEGER DEFAULT 0,
                events_count INTEGER DEFAULT 0
            )
        ''')
        
        # Daily metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_metrics (
                date DATE PRIMARY KEY,
                total_users INTEGER DEFAULT 0,
                active_users INTEGER DEFAULT 0,
                new_users INTEGER DEFAULT 0,
                total_sessions INTEGER DEFAULT 0,
                avg_session_duration INTEGER DEFAULT 0,
                feature_usage TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User retention table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_retention (
                cohort_date DATE,
                days_since_signup INTEGER,
                users_retained INTEGER,
                retention_rate REAL,
                PRIMARY KEY (cohort_date, days_since_signup)
            )
        ''')
        
        conn.commit()
        conn.close()
        
        print(f"✅ Analytics database initialized at {self.db_path}")
    
    def track_event(self, event_type: str, event_data: Optional[Dict] = None, 
                   page_url: Optional[str] = None, user_agent: Optional[str] = None,
                   session_id: Optional[str] = None):
        """Track a user event"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Generate session ID if not provided
            if not session_id:
                session_id = f"session_{int(datetime.now().timestamp())}"
            
            # Insert event
            cursor.execute('''
                INSERT INTO user_events 
                (anonymous_id, session_id, event_type, event_data, page_url, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                self.anonymous_id,
                session_id,
                event_type,
                json.dumps(event_data) if event_data else None,
                page_url,
                user_agent
            ))
            
            # Update session
            cursor.execute('''
                INSERT OR IGNORE INTO sessions (anonymous_id, session_id)
                VALUES (?, ?)
            ''', (self.anonymous_id, session_id))
            
            cursor.execute('''
                UPDATE sessions 
                SET events_count = events_count + 1,
                    end_time = CURRENT_TIMESTAMP,
                    duration = CAST((JULIANDAY(CURRENT_TIMESTAMP) - JULIANDAY(start_time)) * 86400 AS INTEGER)
                WHERE session_id = ?
            ''', (session_id,))
            
            # Update feature usage if applicable
            if event_type.startswith("feature_"):
                feature_name = event_type.replace("feature_", "")
                cursor.execute('''
                    INSERT INTO feature_usage (anonymous_id, feature, usage_count, last_used)
                    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
                    ON CONFLICT(anonymous_id, feature) DO UPDATE SET
                        usage_count = usage_count + 1,
                        last_used = CURRENT_TIMESTAMP
                ''', (self.anonymous_id, feature_name))
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            print(f"Error tracking event: {e}")
            return False
    
    def track_feature_usage(self, feature_name: str, duration_seconds: int = 0):
        """Track feature usage with duration"""
        return self.track_event(
            event_type=f"feature_{feature_name}",
            event_data={"duration": duration_seconds}
        )
    
    def track_page_view(self, page_url: str, user_agent: Optional[str] = None):
        """Track page view"""
        return self.track_event(
            event_type="page_view",
            page_url=page_url,
            user_agent=user_agent
        )
    
    def track_button_click(self, button_id: str, page_url: str):
        """Track button click"""
        return self.track_event(
            event_type="button_click",
            event_data={"button_id": button_id},
            page_url=page_url
        )
    
    def get_key_metrics(self, days: int = 7) -> Dict:
        """Get key product metrics for the last N days"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Total users
        cursor.execute('''
            SELECT COUNT(DISTINCT anonymous_id) 
            FROM user_events 
            WHERE timestamp >= ?
        ''', (start_date.isoformat(),))
        total_users = cursor.fetchone()[0]
        
        # Active users (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        cursor.execute('''
            SELECT COUNT(DISTINCT anonymous_id) 
            FROM user_events 
            WHERE timestamp >= ?
        ''', (week_ago.isoformat(),))
        active_users = cursor.fetchone()[0]
        
        # Daily active users trend
        cursor.execute('''
            SELECT 
                DATE(timestamp) as date,
                COUNT(DISTINCT anonymous_id) as users
            FROM user_events
            WHERE timestamp >= ?
            GROUP BY date
            ORDER BY date DESC
            LIMIT 30
        ''', (start_date.isoformat(),))
        daily_users = cursor.fetchall()
        
        # Most used features
        cursor.execute('''
            SELECT feature, SUM(usage_count) as total_usage
            FROM feature_usage 
            WHERE last_used >= ?
            GROUP BY feature 
            ORDER BY total_usage DESC 
            LIMIT 10
        ''', (start_date.isoformat(),))
        top_features = cursor.fetchall()
        
        # Session metrics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_sessions,
                AVG(duration) as avg_duration,
                SUM(page_views) as total_page_views
            FROM sessions 
            WHERE start_time >= ?
        ''', (start_date.isoformat(),))
        session_stats = cursor.fetchone()
        
        # Event types distribution
        cursor.execute('''
            SELECT event_type, COUNT(*) as count
            FROM user_events
            WHERE timestamp >= ?
            GROUP BY event_type
            ORDER BY count DESC
            LIMIT 20
        ''', (start_date.isoformat(),))
        event_distribution = cursor.fetchall()
        
        # Calculate retention (simplified)
        retention_rate = self.calculate_retention_rate(days)
        
        conn.close()
        
        return {
            "period_days": days,
            "total_users": total_users,
            "active_users": active_users,
            "weekly_retention_rate": f"{retention_rate:.1f}%" if total_users > 0 else "0%",
            "daily_active_users": [
                {"date": date, "users": users} for date, users in daily_users
            ],
            "top_features": [
                {"feature": feature, "usage": usage} for feature, usage in top_features
            ],
            "session_metrics": {
                "total_sessions": session_stats[0] or 0,
                "avg_session_duration_seconds": session_stats[1] or 0,
                "total_page_views": session_stats[2] or 0
            },
            "event_distribution": [
                {"event_type": event_type, "count": count} 
                for event_type, count in event_distribution
            ]
        }
    
    def calculate_retention_rate(self, days: int = 7) -> float:
        """Calculate user retention rate (simplified)"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get total users who started in period
            start_date = datetime.now() - timedelta(days=days)
            
            cursor.execute('''
                SELECT COUNT(DISTINCT anonymous_id)
                FROM user_events
                WHERE DATE(timestamp) = DATE(?)
            ''', (start_date.isoformat(),))
            cohort_size = cursor.fetchone()[0]
            
            if cohort_size == 0:
                return 0.0
            
            # Get users who returned
            cursor.execute('''
                SELECT COUNT(DISTINCT anonymous_id)
                FROM user_events
                WHERE anonymous_id IN (
                    SELECT DISTINCT anonymous_id
                    FROM user_events
                    WHERE DATE(timestamp) = DATE(?)
                )
                AND DATE(timestamp) > DATE(?)
            ''', (start_date.isoformat(), start_date.isoformat()))
            returned_users = cursor.fetchone()[0]
            
            conn.close()
            
            return (returned_users / cohort_size * 100) if cohort_size > 0 else 0.0
            
        except Exception as e:
            print(f"Error calculating retention: {e}")
            return 0.0
    
    def get_feature_analytics(self, feature_name: Optional[str] = None) -> Dict:
        """Get analytics for specific feature or all features"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if feature_name:
            # Get specific feature analytics
            cursor.execute('''
                SELECT 
                    feature,
                    SUM(usage_count) as total_usage,
                    COUNT(DISTINCT anonymous_id) as unique_users,
                    AVG(total_duration) as avg_duration,
                    MIN(first_used) as first_used,
                    MAX(last_used) as last_used
                FROM feature_usage
                WHERE feature = ?
                GROUP BY feature
            ''', (feature_name,))
        else:
            # Get all features
            cursor.execute('''
                SELECT 
                    feature,
                    SUM(usage_count) as total_usage,
                    COUNT(DISTINCT anonymous_id) as unique_users,
                    AVG(total_duration) as avg_duration,
                    MIN(first_used) as first_used,
                    MAX(last_used) as last_used
                FROM feature_usage
                GROUP BY feature
                ORDER BY total_usage DESC
            ''')
        
        features = cursor.fetchall()
        
        # Get usage trend
        cursor.execute('''
            SELECT 
                DATE(last_used) as date,
                feature,
                SUM(usage_count) as daily_usage
            FROM feature_usage
            WHERE last_used >= DATE('now', '-30 days')
            GROUP BY date, feature
            ORDER BY date DESC
        ''')
        usage_trend = cursor.fetchall()
        
        conn.close()
        
        return {
            "features": [
                {
                    "name": row[0],
                    "total_usage": row[1],
                    "unique_users": row[2],
                    "avg_duration_seconds": row[3] or 0,
                    "first_used": row[4],
                    "last_used": row[5]
                }
                for row in features
            ],
            "usage_trend": [
                {
                    "date": date,
                    "feature": feature,
                    "daily_usage": daily_usage
                }
                for date, feature, daily_usage in usage_trend
            ]
        }
    
    def get_user_journey(self, anonymous_id: Optional[str] = None) -> Dict:
        """Get user journey for specific user or aggregate"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if anonymous_id:
            # Get specific user journey
            cursor.execute('''
                SELECT 
                    event_type,
                    page_url,
                    timestamp,
                    event_data
                FROM user_events
                WHERE anonymous_id = ?
                ORDER BY timestamp
                LIMIT 100
            ''', (anonymous_id,))
        else:
            # Get aggregate journey (most common paths)
            cursor.execute('''
                WITH ranked_events AS (
                    SELECT 
                        anonymous_id,
                        event_type,
                        page_url,
                        timestamp,
                        ROW_NUMBER() OVER (PARTITION BY anonymous_id ORDER BY timestamp) as event_order
                    FROM user_events
                )
                SELECT 
                    event_type,
                    page_url,
                    COUNT(*) as frequency,
                    AVG(event_order) as avg_position
                FROM ranked_events
                WHERE event_order <= 10
                GROUP BY event_type, page_url
                ORDER BY frequency DESC
                LIMIT 20
            ''')
        
        journey_data = cursor.fetchall()
        
        # Get session data
        cursor.execute('''
            SELECT 
                COUNT(*) as session_count,
                AVG(duration) as avg_session_duration,
                AVG(page_views) as avg_page_views
            FROM sessions
            WHERE anonymous_id = ? OR ? IS NULL
        ''', (anonymous_id, anonymous_id))
        
        session_stats = cursor.fetchone()
        
        conn.close()
        
        return {
            "user_id": anonymous_id or "aggregate",
            "session_metrics": {
                "session_count": session_stats[0] or 0,
                "avg_session_duration": session_stats[1] or 0,
                "avg_page_views": session_stats[2] or 0
            },
            "journey_events": [
                {
                    "event_type": row[0],
                    "page_url": row[1],
                    "timestamp": row[2],
                    "event_data": json.loads(row[3]) if row[3] else {}
                }
                for row in journey_data
            ] if anonymous_id else [
                {
                    "event_type": row[0],
                    "page_url": row[1],
                    "frequency": row[2],
                    "avg_position": row[3]
                }
                for row in journey_data
            ]
        }
    
    def generate_daily_report(self) -> Dict:
        """Generate daily analytics report"""
        try:
            today = datetime.now().date()
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if report already exists for today
            cursor.execute(
                "SELECT COUNT(*) FROM daily_metrics WHERE date = ?",
                (today.isoformat(),)
            )
            if cursor.fetchone()[0] > 0:
                conn.close()
                return {"message": "Report already exists for today"}
            
            # Calculate metrics
            yesterday = today - timedelta(days=1)
            
            # Total users
            cursor.execute('''
                SELECT COUNT(DISTINCT anonymous_id) 
                FROM user_events 
                WHERE DATE(timestamp) = ?
            ''', (today.isoformat(),))
            total_users = cursor.fetchone()[0]
            
            # Active users (users with events today)
            cursor.execute('''
                SELECT COUNT(DISTINCT anonymous_id) 
                FROM user_events 
                WHERE DATE(timestamp) = ?
            ''', (today.isoformat(),))
            active_users = cursor.fetchone()[0]
            
            # New users (first event today)
            cursor.execute('''
                SELECT COUNT(DISTINCT anonymous_id)
                FROM user_events
                WHERE anonymous_id NOT IN (
                    SELECT DISTINCT anonymous_id
                    FROM user_events
                    WHERE DATE(timestamp) < ?
                )
                AND DATE(timestamp) = ?
            ''', (today.isoformat(), today.isoformat()))
            new_users = cursor.fetchone()[0]
            
            # Total sessions
            cursor.execute('''
                SELECT COUNT(*)
                FROM sessions
                WHERE DATE(start_time) = ?
            ''', (today.isoformat(),))
            total_sessions = cursor.fetchone()[0]
            
            # Average session duration
            cursor.execute('''
                SELECT AVG(duration)
                FROM sessions
                WHERE DATE(start_time) = ?
                AND duration > 0
            ''', (today.isoformat(),))
            avg_session_duration = cursor.fetchone()[0] or 0
            
            # Feature usage (top 10)
            cursor.execute('''
                SELECT feature, SUM(usage_count) as usage
                FROM feature_usage
                WHERE DATE(last_used) = ?
                GROUP BY feature
                ORDER BY usage DESC
                LIMIT 10
            ''', (today.isoformat(),))
            feature_usage = cursor.fetchall()
            
            feature_usage_json = json.dumps([
                {"feature": feature, "usage": usage}
                for feature, usage in feature_usage
            ])
            
            # Insert daily metrics
            cursor.execute('''
                INSERT INTO daily_metrics 
                (date, total_users, active_users, new_users, total_sessions, avg_session_duration, feature_usage)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                today.isoformat(),
                total_users,
                active_users,
                new_users,
                total_sessions,
                avg_session_duration,
                feature_usage_json
            ))
            
            conn.commit()
            conn.close()
            
            print(f"✅ Daily report generated for {today}")
            
            return {
                "success": True,
                "date": today.isoformat(),
                "metrics": {
                    "total_users": total_users,
                    "active_users": active_users,
                    "new_users": new_users,
                    "total_sessions": total_sessions,
                    "avg_session_duration": avg_session_duration,
                    "feature_usage": [
                        {"feature": feature, "usage": usage}
                        for feature, usage in feature_usage
                    ]
                }
            }
            
        except Exception as e:
            print(f"Error generating daily report: {e}")
            return {"success": False, "error": str(e)}
    
    def get_recommendations(self) -> List[Dict]:
        """Get data-driven recommendations for product improvement"""
        recommendations = []
        
        # Get underused features
        feature_analytics = self.get_feature_analytics()
        all_features = [
            "desktop_recorder", "file_organizer", "workflow_builder",
            "ai_automation", "marketplace", "analytics", "mobile"
        ]
        
        used_features = {f["name"] for f in feature_analytics["features"]}
        unused_features = set(all_features) - used_features
        
        if unused_features:
            recommendations.append({
                "type": "feature_promotion",
                "priority": "medium",
                "title": "Promote Underused Features",
                "description": f"These features are not being used: {', '.join(unused_features)}",
                "suggestion": "Add tutorials or highlight these features in the dashboard"
            })
        
        # Check session duration
        metrics = self.get_key_metrics(7)
        avg_session_duration = metrics["session_metrics"]["avg_session_duration_seconds"]
        
        if avg_session_duration < 60:
            recommendations.append({
                "type": "engagement",
                "priority": "high",
                "title": "Low Session Duration",
                "description": f"Average session duration is only {avg_session_duration:.0f} seconds",
                "suggestion": "Improve onboarding or add interactive tutorials"
            })
        
        # Check feature usage distribution
        if feature_analytics["features"]:
            top_feature = feature_analytics["features"][0]
            if top_feature["total_usage"] > 100:
                recommendations.append({
                    "type": "feature_balance",
                    "priority": "low",
                    "title": "Feature Usage Imbalance",
                    "description": f"{top_feature['name']} accounts for most usage",
                    "suggestion": "Consider promoting other features or adding integrations"
                })
        
        return recommendations

# For testing
if __name__ == "__main__":
    # Test analytics
    print("📊 Testing Analytics System")
    print("-" * 40)
    
    analytics = ProductAnalytics()
    
    # Track some test events
    analytics.track_event("app_start")
    analytics.track_feature_usage("desktop_recorder", 120)
    analytics.track_page_view("/dashboard")
    analytics.track_button_click("start_recording", "/desktop-recorder")
    
    # Get metrics
    metrics = analytics.get_key_metrics(7)
    print(f"Total Users: {metrics['total_users']}")
    print(f"Active Users: {metrics['active_users']}")
    print(f"Retention Rate: {metrics['weekly_retention_rate']}")