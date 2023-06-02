import { readdir } from "fs/promises";
import path from "path";
import { Body, Controller, Get, Path, Post, Route, SuccessResponse } from "tsoa";
import { getAirports } from "../../core/airport";
import { calculateResolution } from "../../core/calculateResolution";
import type { BaseImageOptions, ColorImageOptions, MapboxImageOptions } from "../../core/generateImage";
import { generateImage } from "../../core/generateImage";
import { changeImage, createImage, getStatus } from "../../core/image";
import type {
  Airport,
  ColorSchema,
  Cutout,
  ImageStatus,
  MapboxSchema,
  ProjectionType,
  Timespan,
} from "../../core/models";
import { PROJECTIONS } from "../../core/models";
import { Env } from "../../env";
import { cutoutMinMaxStrategy } from "../../utils";

export interface AirportOptionsResponse {
  airports: Airport[];
}

@Route("api/airports")
export class AirportController extends Controller {
  @Get("/options")
  public async getAirportOptions(): Promise<AirportOptionsResponse> {
    const airports = await getAirports();
    return {
      airports,
    };
  }
}

export interface ProjectionOptionsResponse {
  projections: ProjectionType[];
}

@Route("api/projections")
export class ProjectionController extends Controller {
  @Get("/options")
  public getProjectionOptions(): ProjectionOptionsResponse {
    return { projections: PROJECTIONS };
  }
}

export interface GenerateImageRequest {
  projection: ProjectionType;
  resolution: number;
  cutout: Cutout;
  timespan?: Timespan;
  schema: ColorSchema | MapboxSchema;
}

export interface ImageGenerationResponse {
  id: string;
}

export interface ImageStatusResponse {
  id: string;
  status: ImageStatus;
}

@Route("api/image")
export class ImageController extends Controller {
  @Get("/all")
  public async getAllImagePaths(): Promise<{ data: string[] }> {
    const path = Env.imageLocation;
    try {
      const files = await readdir(path);
      return {
        data: files,
      };
    } catch (err: unknown) {
      console.error(err);
      return {
        data: [],
      };
    }
  }

  @SuccessResponse("201", "image generation started")
  @Post()
  public async generateImage(@Body() data: GenerateImageRequest): Promise<ImageGenerationResponse> {
    const id = await createImage();

    async function generate(): Promise<void> {
      const { maxCoordinate, minCoordinate } = cutoutMinMaxStrategy(data.cutout);
      const resolution = calculateResolution(data.resolution, minCoordinate, maxCoordinate);

      const baseImageOptions: BaseImageOptions = {
        foregroundColor: data.schema.foreground,
        projection: data.projection,
        renderEllipse: false,
        resolution: data.resolution,
      };

      const imageOptions: MapboxImageOptions | ColorImageOptions = data.schema.useMapbox
        ? {
            ...baseImageOptions,
            backgroundMapbox: true,
            mapboxStyle: data.schema.mapboxStyle,
          }
        : { ...baseImageOptions, backgroundMapbox: false, backgroundColor: data.schema.background };
      await generateImage({
        filterOptions: {
          timespan: {
            from: data.timespan?.from,
            until: data.timespan?.until,
          },
        },
        coordinates: { maximum: maxCoordinate, minimum: minCoordinate },
        imageOptions,
        outputPath: path.resolve(Env.imageLocation, `flightpath_${id}.png`),
      });

      await changeImage(id, {
        metadata: {
          schema: data.schema,
          resolution,
          projection: data.projection,
          timespan: data.timespan,
          cutout: data.cutout,
        },
        status: "CREATED",
      });
    }

    void generate();

    return { id };
  }

  @Get("/{imageId}/status")
  public async getImageStatus(@Path() imageId: string): Promise<ImageStatusResponse> {
    const imageStatus = await getStatus(imageId);
    return {
      id: imageId,
      status: imageStatus,
    };
  }
}
