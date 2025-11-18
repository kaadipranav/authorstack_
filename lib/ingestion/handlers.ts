import { IngestionJob, IngestionResult, IngestionPlatform } from "./types";

export async function handleAmazonKdpIngestion(job: IngestionJob): Promise<IngestionResult> {
  try {
    const { storagePath } = job.payload as { storagePath?: string };

    if (!storagePath) {
      return {
        success: false,
        jobId: job.id,
        message: "Missing storage path for KDP CSV",
        error: "MISSING_STORAGE_PATH",
      };
    }

    console.log(`[KDP] Processing ingestion for profile ${job.profile_id}, storage path: ${storagePath}`);

    const salesEventsCreated = 0;

    return {
      success: true,
      jobId: job.id,
      message: `KDP ingestion placeholder: would parse CSV from ${storagePath}`,
      salesEventsCreated,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      jobId: job.id,
      message: "KDP ingestion failed",
      error: errorMessage,
    };
  }
}

export async function handleGumroadIngestion(job: IngestionJob): Promise<IngestionResult> {
  try {
    const { accessToken } = job.payload as { accessToken?: string };

    if (!accessToken) {
      return {
        success: false,
        jobId: job.id,
        message: "Missing Gumroad access token",
        error: "MISSING_ACCESS_TOKEN",
      };
    }

    console.log(`[Gumroad] Processing ingestion for profile ${job.profile_id}`);

    const salesEventsCreated = 0;

    return {
      success: true,
      jobId: job.id,
      message: "Gumroad ingestion placeholder: would fetch sales via API",
      salesEventsCreated,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      jobId: job.id,
      message: "Gumroad ingestion failed",
      error: errorMessage,
    };
  }
}

export async function handleSmashwordsIngestion(job: IngestionJob): Promise<IngestionResult> {
  try {
    console.log(`[Smashwords] Processing ingestion for profile ${job.profile_id}`);

    const salesEventsCreated = 0;

    return {
      success: true,
      jobId: job.id,
      message: "Smashwords ingestion placeholder: ready for API integration",
      salesEventsCreated,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      jobId: job.id,
      message: "Smashwords ingestion failed",
      error: errorMessage,
    };
  }
}

export async function handleDraft2DigitalIngestion(job: IngestionJob): Promise<IngestionResult> {
  try {
    console.log(`[Draft2Digital] Processing ingestion for profile ${job.profile_id}`);

    const salesEventsCreated = 0;

    return {
      success: true,
      jobId: job.id,
      message: "Draft2Digital ingestion placeholder: ready for API integration",
      salesEventsCreated,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      jobId: job.id,
      message: "Draft2Digital ingestion failed",
      error: errorMessage,
    };
  }
}

export async function getHandlerForPlatform(
  platform: IngestionPlatform
): Promise<(job: IngestionJob) => Promise<IngestionResult>> {
  switch (platform) {
    case "amazon_kdp":
      return handleAmazonKdpIngestion;
    case "gumroad":
      return handleGumroadIngestion;
    case "smashwords":
      return handleSmashwordsIngestion;
    case "draft2digital":
      return handleDraft2DigitalIngestion;
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
