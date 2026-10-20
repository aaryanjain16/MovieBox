from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_async_engine(
    DATABASE_URL, 
    echo=True, 
    
    )

AsyncSessionLocal = async_sessionmaker(
    bind = engine,
    expire_on_commit=False,
    class_=AsyncSession
)

class Base(DeclarativeBase):
    pass


async def init_db():
    from models import WatchlistMovie

    async with engine.begin() as conn:

        # Create table if it doesn't exist
        await conn.run_sync(
            Base.metadata.create_all
        )

        # Check and add rating column
        result = await conn.execute(
            text("""
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'watchlist'
                AND COLUMN_NAME = 'rating'
            """)
        )

        if result.scalar() == 0:
            await conn.execute(
                text("""
                    ALTER TABLE watchlist
                    ADD COLUMN rating INT NULL
                """)
            )

        # Check and add review column
        result = await conn.execute(
            text("""
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'watchlist'
                AND COLUMN_NAME = 'review'
            """)
        )

        if result.scalar() == 0:
            await conn.execute(
                text("""
                    ALTER TABLE watchlist
                    ADD COLUMN review TEXT NULL
                """)
            )

        # Check and add watched column
        result = await conn.execute(
            text("""
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'watchlist'
                AND COLUMN_NAME = 'watched'
            """)
        )

        if result.scalar() == 0:
            await conn.execute(
                text("""
                    ALTER TABLE watchlist
                    ADD COLUMN watched BOOLEAN NOT NULL DEFAULT FALSE
                """)
            )
            
            
            
        # Add user_id column if it doesn't exist
        result = await conn.execute(text("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'watchlist'
              AND COLUMN_NAME = 'user_id'
        """))

        if result.scalar() == 0:
            await conn.execute(text("""
                ALTER TABLE watchlist
                ADD COLUMN user_id INT NULL
            """))

        # Find the existing global unique index on imdb_id
        result = await conn.execute(text("""
            SELECT INDEX_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'watchlist'
              AND COLUMN_NAME = 'imdb_id'
              AND NON_UNIQUE = 0
        """))

        unique_indexes = result.scalars().all()

        for index_name in unique_indexes:
            # Preserve the primary key and remove only the old
            # uniqueness restriction on imdb_id.
            if index_name != "PRIMARY":
                safe_index_name = index_name.replace("`", "``")
                await conn.execute(text(
                    f"ALTER TABLE watchlist DROP INDEX `{safe_index_name}`"
                ))

        # Assign existing movies to the first registered user.
        # If there are no registered users, leave them unassigned.
        result = await conn.execute(text("""
            SELECT id FROM users ORDER BY id LIMIT 1
        """))

        first_user_id = result.scalar_one_or_none()

        if first_user_id is not None:
            await conn.execute(
                text("""
                    UPDATE watchlist
                    SET user_id = :user_id
                    WHERE user_id IS NULL
                """),
                {"user_id": first_user_id}
            )
        
        
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session