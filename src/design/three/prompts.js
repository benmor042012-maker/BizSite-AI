/**
 * The vendored design specs, bundled as text.
 *
 * `wrangler.jsonc` declares a Text module rule for *.md, so these import as
 * strings at build time. That keeps vendor/ the only copy of the prompts while
 * letting the 3D export embed the right one without a runtime fetch.
 *
 * Generated from the `prompt` fields in presets.js - keep the two in step.
 */

import Basilico_Restaurant from '../../../vendor/motionsites-prompts/prompts/Basilico_Restaurant.md';
import Calm_Hero from '../../../vendor/motionsites-prompts/prompts/Calm_Hero.md';
import Car_Shine from '../../../vendor/motionsites-prompts/prompts/Car_Shine.md';
import Green_Hero from '../../../vendor/motionsites-prompts/prompts/Green_Hero.md';
import Interactive_3D_Hero from '../../../vendor/motionsites-prompts/prompts/Interactive_3D_Hero.md';
import My_portfolio from '../../../vendor/motionsites-prompts/prompts/My_portfolio.md';
import Naturally from '../../../vendor/motionsites-prompts/prompts/Naturally.md';
import Northline from '../../../vendor/motionsites-prompts/prompts/Northline.md';
import luxury_watch from '../../../vendor/motionsites-prompts/prompts/luxury_watch.md';

/** preset key -> its design spec. */
export const PRESET_PROMPTS = {
  'cinematic-plate': Basilico_Restaurant,
  'warm-grain': Naturally,
  'sharp-edge': Car_Shine,
  'silk-flow': luxury_watch,
  'clinical-depth': Calm_Hero,
  'kinetic-grid': Interactive_3D_Hero,
  'weighted-still': Northline,
  'soft-orbit': Green_Hero,
  'frame-parallax': My_portfolio,
};

export const getPromptText = key => PRESET_PROMPTS[key] || '';
