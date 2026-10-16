export function publicBuildDefines() {
  return {"process.env.NEXT_PUBLIC_MASHROOM_BUILD_TIME":JSON.stringify(new Date().toISOString())};
}
