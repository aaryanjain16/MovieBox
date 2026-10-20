from sqlalchemy import Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class WatchlistMovie(Base):
    __tablename__ = "watchlist"
    
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )
    
    imdb_id: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )
    
    year: Mapped[str] = mapped_column(
        String(20)
    )
    
    movie_type: Mapped[str] = mapped_column(
        String(25)
    )
    
    poster: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    
    rating: Mapped[int| None] = mapped_column(
        Integer,
        nullable=True
    )
    
    review : Mapped[str| None] = mapped_column(
        Text,
        nullable=True
    )
    
    watched : Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    
    user_id : Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )
    

class User(Base):
    __tablename__= "users"
    
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True  
    )
    
    username: Mapped[str]= mapped_column(
        String(50),
        unique=True,
        nullable=False
    )
    
    email: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )
    
    password: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )