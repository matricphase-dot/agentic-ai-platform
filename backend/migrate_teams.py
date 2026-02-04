# backend/migrate_teams.py
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from app.database import Base, engine
from app.models.user import User
from app.models.agent import Agent
from app.models.team import Team, TeamInvitation
from datetime import datetime

def create_teams_tables():
    """Create teams and related tables"""
    try:
        print("🔄 Creating teams tables...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Teams tables created successfully!")
        
        # Create initial admin team if it doesn't exist
        from app.database import SessionLocal
        db = SessionLocal()
        
        # Find admin user
        admin = db.query(User).filter(User.email == "admin@agenticai.com").first()
        
        if admin:
            # Check if admin already has a personal team
            existing_team = db.query(Team).filter(
                Team.owner_id == admin.id,
                Team.name == "My Team"
            ).first()
            
            if not existing_team:
                print("👥 Creating admin personal team...")
                team = Team(
                    name="My Team",
                    description="Personal workspace",
                    owner_id=admin.id,
                    visibility="private"
                )
                team.members.append(admin)
                db.add(team)
                db.commit()
                print("✅ Admin team created")
            
            # Migrate existing agents to the team
            agents_without_team = db.query(Agent).filter(
                Agent.user_id == admin.id,
                Agent.team_id == None
            ).all()
            
            if agents_without_team:
                print(f"🔄 Migrating {len(agents_without_team)} agents to team...")
                for agent in agents_without_team:
                    agent.team_id = team.id if 'team' in locals() else existing_team.id
                db.commit()
                print("✅ Agents migrated to team")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error creating teams tables: {e}")
        raise

def add_sample_teams():
    """Add sample teams for testing"""
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        
        # Get admin user
        admin = db.query(User).filter(User.email == "admin@agenticai.com").first()
        
        if admin:
            sample_teams = [
                {
                    "name": "Marketing Team",
                    "description": "Marketing and content creation team",
                    "visibility": "public"
                },
                {
                    "name": "Development Team",
                    "description": "Software development and coding",
                    "visibility": "private"
                },
                {
                    "name": "Support Team",
                    "description": "Customer support and assistance",
                    "visibility": "private"
                }
            ]
            
            for team_data in sample_teams:
                existing = db.query(Team).filter(
                    Team.owner_id == admin.id,
                    Team.name == team_data["name"]
                ).first()
                
                if not existing:
                    team = Team(
                        name=team_data["name"],
                        description=team_data["description"],
                        visibility=team_data["visibility"],
                        owner_id=admin.id
                    )
                    team.members.append(admin)
                    db.add(team)
                    print(f"✅ Created sample team: {team_data['name']}")
            
            db.commit()
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error adding sample teams: {e}")

def main():
    """Main migration function"""
    print("🚀 Agentic AI Platform - Teams Migration")
    print("=" * 50)
    
    try:
        # Test database connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print(f"✅ Connected to PostgreSQL: {result.fetchone()[0]}")
        
        # Create tables
        create_teams_tables()
        
        # Add sample teams
        add_sample_teams()
        
        print("\n🎉 Teams migration complete!")
        print("\nNew endpoints available:")
        print("- GET /api/v1/teams - List teams")
        print("- POST /api/v1/teams - Create team")
        print("- GET /api/v1/teams/{id} - Get team details")
        print("- POST /api/v1/teams/{id}/invite - Invite member")
        print("- GET /api/v1/teams/{id}/agents - Get team agents")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()