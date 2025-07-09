CREATE DATABASE discord_bot;
USE discord_bot;

CREATE TABLE actividad (
	user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100),
    last_seen DATETIME
    );