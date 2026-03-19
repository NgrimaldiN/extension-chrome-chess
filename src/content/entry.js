(async () => {
  const { bootstrapContentScript } = await import(
    chrome.runtime.getURL("src/content/bootstrap.js")
  );

  await bootstrapContentScript();
})().catch((error) => {
  console.error("[No Tilt Chess] content bootstrap failure", error);
});
