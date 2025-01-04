from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List, Optional
from datetime import datetime, date

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    email_verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginData(BaseModel):
    email: str
    password: str

class AbsenceCreate(BaseModel):
    start_date: date = Field(..., title="Data początkowa nieobecności")
    end_date: date = Field(..., title="Data końcowa nieobecności")
    reason: str = Field(..., title="Powód nieobecności")

    @validator('end_date')
    def validate_dates(cls, v, values):
        start_date = values.get('start_date')
        if start_date and v < start_date:
            raise ValueError('Data końcowa musi być po lub równa dacie początkowej')
        return v

    class Config:
        from_attributes = True

class CalendarResponse(BaseModel):
    calendar: Dict[str, Dict[str, Any]]
    currentMonth: str
    formattedCurrentMonth: str
    monthOffset: int
    users: List[Dict[str, Any]]
    selectedUserId: int
