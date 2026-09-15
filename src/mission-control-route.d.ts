import type { Route as MissionControlRoute } from "./routes/mission-control";

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/mission-control": {
      id: "/mission-control";
      path: "/mission-control";
      fullPath: "/mission-control";
      preLoaderRoute: typeof MissionControlRoute;
      parentRoute: never;
    };
  }
}
