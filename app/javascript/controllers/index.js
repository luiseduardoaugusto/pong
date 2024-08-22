// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "controllers/application"
import MatchController from "./match_controller"
application.register("match", MatchController)