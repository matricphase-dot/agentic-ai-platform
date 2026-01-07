import sqlite3, json, time, os
from datetime import datetime

class AnalyticsEngine:
    def __init__(self):
        self.db_path = "database/analytics.db"
        self.init_database()
    
    def init_database(self):
        os.makedirs("database", exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT,
                data TEXT,
                user_id INTEGER DEFAULT 1,
                timestamp TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS time_savings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                automation_type TEXT,
                time_saved_minutes INTEGER,
                timestamp TEXT
            )
        ''')
        conn.commit()
        conn.close()
    
    def track_event(self, event_type, data=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO events (event_type, data, timestamp) VALUES (?, ?, ?)",
            (event_type, json.dumps(data or {}), datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        return {"status": "tracked"}
    
    def record_time_saving(self, automation_type, minutes_saved):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO time_savings (automation_type, time_saved_minutes, timestamp) VALUES (?, ?, ?)",
            (automation_type, minutes_saved, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        return {"status": "recorded"}
    
    def get_stats(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM events")
        total_events = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(time_saved_minutes) FROM time_savings")
        total_time_saved = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(DISTINCT event_type) FROM events")
        event_types = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_events": total_events,
            "total_time_saved_minutes": total_time_saved,
            "total_time_saved_hours": round(total_time_saved / 60, 1),
            "event_types": event_types,
            "daily_average": round(total_time_saved / 7, 1) if total_time_saved > 0 else 0
        }

analytics = AnalyticsEngine()