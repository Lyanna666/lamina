import { router } from "./router.js";
import { store } from "./store.js";

import { MainMenuScreen } from "./screens/main_menu.js";

store.load();

router.register("main_menu", MainMenuScreen);

router.go("main_menu");
