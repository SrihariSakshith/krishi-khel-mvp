-- CreateTable
CREATE TABLE "WeatherCache" (
    "location" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherCache_pkey" PRIMARY KEY ("location")
);
