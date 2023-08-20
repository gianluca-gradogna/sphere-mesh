import settings from "../store/settings";
import { Pane } from "tweakpane";

const tweak = new Pane(); 
!settings.debugger && (tweak.hidden = true)

export default tweak;
