import { router } from "./router.js";
import { store } from "./store.js";

import { MainMenuScreen } from "./screens/main_menu.js";
import { CalendarScreen } from "./screens/calendar.js";


store.load();

router.register("main_menu", MainMenuScreen);
router.register("calendar", CalendarScreen)


// En js/app.js, después de registrar
console.log("Screens registradas:", router);

router.go("main_menu");
