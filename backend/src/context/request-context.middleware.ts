import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { requestContext } from "./request-context";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const traceId =
      (req.headers['x-trace-id'] as string) ?? randomUUID();

    const userId = (req as any).user?.id;

    const channel =
        (req.headers['x-channel'] as string) ?? 'WEB_APP';

    requestContext.run(
      {
        traceId,
        userId: userId?.toString(),
        channel,
      },
      next,
    );
  }
}
