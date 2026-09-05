import { TitleScene } from './TitleScene.js';
import { AirportScene } from './AirportScene.js';
import { FlightScene } from './FlightScene.js';
import { BarScene } from './BarScene.js';
import { ClubScene } from './ClubScene.js';
import { PizzaScene } from './PizzaScene.js';
import { MorningScene } from './MorningScene.js';
import { ConferenceScene } from './ConferenceScene.js';
import { UberScene } from './UberScene.js';
import { RestaurantScene } from './RestaurantScene.js';
import { MovieScene } from './MovieScene.js';
import { DriveToHotelScene } from './DriveToHotelScene.js';
import { FancyHotelScene } from './FancyHotelScene.js';
import { DowntownScene } from './DowntownScene.js';
import { TravelScene } from './TravelScene.js';
import { HouseScene } from './HouseScene.js';
import { SurgeryScene } from './SurgeryScene.js';
import { BurialScene } from './BurialScene.js';
import { NewYearsScene } from './NewYearsScene.js';
import { ApartmentScene } from './ApartmentScene.js';
import { ThanksgivingScene } from './ThanksgivingScene.js';
import { HomeScene } from './HomeScene.js';
import { PresentScene } from './PresentScene.js';

// The story is one linear chain of scene.start() calls. This list is kept in
// narrative order; only the first entry matters to Phaser (it boots first).
// tests/sceneFlow.test.js checks it against the actual transitions in source.
export const SCENES = [
    TitleScene,
    AirportScene,
    FlightScene,
    BarScene,
    ClubScene,
    PizzaScene,
    MorningScene,
    ConferenceScene,
    UberScene,
    RestaurantScene,
    MovieScene,
    DriveToHotelScene,
    FancyHotelScene,
    DowntownScene,
    TravelScene,
    HouseScene,
    SurgeryScene,
    BurialScene,
    NewYearsScene,
    ApartmentScene,
    ThanksgivingScene,
    HomeScene,
    PresentScene
];

export const STORY_ORDER = SCENES.map(Scene => Scene.name);
