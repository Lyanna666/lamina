import { router } from "./router.js";
import { store } from "./store.js";

import { MainMenuScreen } from "./screens/main_menu.js";
import { CalendarScreen } from "./screens/calendar.js";
import { SalonScene } from "./screens/salon.js";

store.load();

router.register("main_menu", MainMenuScreen);
router.register("calendar", CalendarScreen);
router.register("salon", SalonScene);


// En js/app.js, después de registrar
console.log("Screens registradas:", router);

router.go("main_menu");
