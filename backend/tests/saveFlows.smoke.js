import assert from "node:assert";
import { addMealRecord, getMealSummaryForDate } from "../services/mealService.js";
import { addExerciseRecord, getWorkoutSummaryForDate, saveWorkoutSettings, getWorkoutSettings } from "../services/workoutService.js";
import { addWeightRecord, getWeightSummary } from "../services/weightService.js";

// Simple smoke checks for core persistence flows. These run against the in-memory
// store so they do not need external services or a running server.
const TEST_DATE = "2099-12-31";

const runMealFlow = () => {
  const created = addMealRecord({
    date: TEST_DATE,
    mealType: "dinner",
    memo: "smoke test entry",
    foods: [
      { name: "テストフード", portion: "1皿", calories: 400 },
      { name: "サラダ", portion: "1皿", calories: 80 },
    ],
  });

  assert.ok(created?.id, "meal record should return an id");
  assert.equal(created.totalCalories, 480, "meal calories should be totaled");

  const summary = getMealSummaryForDate(TEST_DATE);
  const hasEntry = summary.records.some((record) => record.id === created.id);
  assert.ok(hasEntry, "saved meal should appear in daily summary");
  assert.equal(summary.totalCalories >= 480, true, "daily total should include saved meal calories");
};

const runExerciseFlow = () => {
  const created = addExerciseRecord({
    date: TEST_DATE,
    type: "スモークテスト運動",
    duration: 30,
    calories: 200,
    memo: "smoke test entry",
  });

  assert.ok(created?.id, "exercise record should return an id");

  const summary = getWorkoutSummaryForDate(TEST_DATE);
  const hasEntry = summary.records.some((record) => record.id === created.id);
  assert.ok(hasEntry, "saved exercise should appear in daily summary");
  assert.equal(summary.totalCalories >= 200, true, "daily burn total should include exercise calories");
};

const runWorkoutSettingsFlow = () => {
  saveWorkoutSettings({
    0: { menus: [{ name: "テストメニュー", type: "reps", value: 10, sets: 3 }] },
  });
  const settings = getWorkoutSettings();
  assert.ok(Array.isArray(settings[0]?.menus), "settings should contain menus array for Monday");
  const mondayMenu = settings[0].menus.find((menu) => menu.name === "テストメニュー");
  assert.ok(mondayMenu, "saved menu should be retrievable");
  assert.equal(mondayMenu.sets, 3, "saved menu should preserve sets value");
};

const runWeightFlow = () => {
  const created = addWeightRecord({ date: TEST_DATE, weight: 55.5 });
  assert.equal(created.weight, 55.5, "weight record should echo saved value");

  const summary = getWeightSummary();
  assert.equal(typeof summary.currentWeight, "number", "weight summary should have a numeric current weight");
};

try {
  runMealFlow();
  runExerciseFlow();
  runWorkoutSettingsFlow();
  runWeightFlow();
  console.log("✅ Save flow smoke tests passed");
} catch (error) {
  console.error("❌ Save flow smoke tests failed", error);
  process.exitCode = 1;
}
