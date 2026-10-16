import { version } from "../package.json";

// package.json is the release source of truth; both build targets inject
// their build time. Never infer a release number from demo progress.
export const appVersion=version;
export const releaseLabel=`alpha ${appVersion}`;
export const buildTimestamp=process.env.NEXT_PUBLIC_MASHROOM_BUILD_TIME||"";
export const buildDescription=buildTimestamp?`Built ${buildTimestamp}`:"Local development build";
