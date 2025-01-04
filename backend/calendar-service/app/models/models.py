from sqlalchemy import Column, Integer, String, DateTime, create_engine, TIMESTAMP, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import BIGINT as BigInteger
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(BigInteger(unsigned=True), primary_key=True, index=True, autoincrement=True)
    name = Column(String(191), nullable=False)
    email = Column(String(191), nullable=False, index=True)
    email_verified_at = Column(TIMESTAMP, nullable=True)
    password = Column(String(191), nullable=False)
    remember_token = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    absences = relationship("Absence", back_populates="user")

class Absence(Base):
    __tablename__ = 'absences'

    id = Column(BigInteger(unsigned=True), primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger(unsigned=True), ForeignKey('users.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="absences")
