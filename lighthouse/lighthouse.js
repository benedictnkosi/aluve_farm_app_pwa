import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import process from 'process';

// Assuming arguments are passed in the same order: URL, CONFIG_PATH, TEST_TYPE
const [,, URL, CONFIG_PATH, TEST_TYPE] = process.argv;

// Construct the output file paths
const outputPath = `${TEST_TYPE}.report.json`;

// Detect the operating system
const platform = os.platform();
console.log(`Operating System: ${platform}`);

// Run Lighthouse CLI with custom configuration
const xvfbPrefix = platform === 'linux' ? 'xvfb-run --auto-servernum --server-args="-screen 0 1280x1024x24" ' : '';
const lighthouseCommand = `${xvfbPrefix}npx lighthouse "${URL}" --config-path="${CONFIG_PATH}" --output=json --output=html --output-path=./${TEST_TYPE}`;

exec(lighthouseCommand, (error) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }

  // Read the JSON output
  fs.readFile(path.resolve(outputPath), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const report = JSON.parse(data);
    const performanceScore = report.categories.performance.score;
    const accessibilityScore = report.categories.accessibility.score;
    const bestPracticesScore = report.categories['best-practices'].score;

    // Convert the scores to percentages
    const performancePercentage = (performanceScore * 100).toFixed(2);
    const accessibilityPercentage = (accessibilityScore * 100).toFixed(2);
    const bestPracticePercentage = (bestPracticesScore * 100).toFixed(2);

    // Check if the scores are above 90
    if (performancePercentage > 90 && accessibilityPercentage > 90 && bestPracticePercentage > 90) {
      console.log("Lighthouse score is great");
      process.exit(0);
    } else {
      console.log("Lighthouse score failed");
      process.exit(1);
    }
  });
});