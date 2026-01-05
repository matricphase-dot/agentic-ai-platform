"""
ANALYTICS ENGINE MODULE
Analytics and reporting system
"""
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class AnalyticsEventType(Enum):
    """Types of analytics events"""
    USER_LOGIN = "user_login"
    AUTOMATION_START = "automation_start"
    AUTOMATION_COMPLETE = "automation_complete"
    FILE_OPERATION = "file_operation"
    RECORDING_START = "recording_start"

@dataclass
class AnalyticsEvent:
    """Analytics event data structure"""
    event_id: str
    user_id: str
    event_type: str
    timestamp: datetime
    session_id: str
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class AnalyticsEngine:
    """Analytics engine for tracking usage"""
    
    def __init__(self, db_path: str = "database/analytics.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize analytics database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS events (
                event_id TEXT PRIMARY KEY,
                user_id TEXT,
                event_type TEXT,
                timestamp DATETIME,
                session_id TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_stats (
                date DATE PRIMARY KEY,
                users_count INTEGER DEFAULT 0,
                automations_run INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def track_event(self, event: AnalyticsEvent):
        """Track an analytics event"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO events VALUES (?, ?, ?, ?, ?)
        ''', (
            event.event_id,
            event.user_id,
            event.event_type,
            event.timestamp.isoformat(),
            event.session_id
        ))
        
        conn.commit()
        conn.close()
    
    def get_daily_stats(self, date: datetime = None) -> Dict:
        """Get daily statistics"""
        if not date:
            date = datetime.now()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        date_str = date.date().isoformat()
        cursor.execute('SELECT * FROM daily_stats WHERE date = ?', (date_str,))
        row = cursor.fetchone()
        
        if row:
            stats = {
                "date": row[0],
                "users_count": row[1],
                "automations_run": row[2]
            }
        else:
            stats = {
                "date": date_str,
                "users_count": 0,
                "automations_run": 0
            }
        
        conn.close()
        return stats

# Simple analytics without seaborn dependency
def quick_analytics():
    """Quick analytics function"""
    engine = AnalyticsEngine()
    return engine.get_daily_stats()