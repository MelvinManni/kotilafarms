// Feed: conversion, stock, run-out and feed cost per kg of live weight
// FCR = feed eaten (kg) ÷ live weight produced (kg)
export function feedConversionRatio(feedKg: number, liveWeightKg: number): number {
  return liveWeightKg > 0 ? feedKg / liveWeightKg : Number.NaN;
}

// Live weight produced = birds × average weight
export function liveWeightKg(birds: number, averageGrams: number): number {
  return (birds * averageGrams) / 1000;
}

// Stock = bags bought − bags used (never below zero on screen, but kept exact here)
export function feedStockBags(boughtBags: number, usedBags: number): number {
  return Math.round((boughtBags - usedBags) * 100) / 100;
}

// Average bags a day over the given daily use (e.g. the last 3 logged days)
export function averageDailyUse(bagsPerDay: number[]): number {
  return bagsPerDay.length ? bagsPerDay.reduce((a, b) => a + b, 0) / bagsPerDay.length : 0;
}

// Days until the store is empty at this rate; null when nothing is being used
export function daysOfFeedLeft(stockBags: number, bagsPerDay: number): number | null {
  if (bagsPerDay <= 0) return null;
  return Math.max(0, stockBags) / bagsPerDay;
}

// Feed cost per kg live weight = feed spend ÷ live weight produced, whole naira
export function feedCostPerKgLiveWeight(feedSpend: number, liveKg: number): number {
  return liveKg > 0 ? Math.round(feedSpend / liveKg) : Number.NaN;
}
