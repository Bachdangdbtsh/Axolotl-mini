import Fastify from "fastify";
import { userRoutes } from "./modules/users/user_route.js";
import { authRoutes } from "./modules/users/auth/auth_route.js";
import { classRoutes } from "./modules/class/class_route.js";
import { questionBankRoutes } from "./modules/questionBank/questionBank_route.js";
import { questionRoutes } from "./modules/question/question_route.js";
import { examRoutes } from "./modules/examQuestion/exam_route.js";
import { assignmentRoutes } from "./modules/assignment/assignment_route.js";
import { attemptRoutes } from "./modules/attempt/attempt_route.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(userRoutes, { prefix: "/users" });
  app.register(authRoutes, { prefix: "/auth" });
  app.register(classRoutes, { prefix: "/classes" });
  app.register(questionBankRoutes, {prefix: "/question_banks"});
  app.register(questionRoutes, {prefix: "/questions"});
  app.register(examRoutes, {prefix: "/exams"});
  app . register( assignmentRoutes , { prefix : '/assignments' } ); 
  app . register ( attemptRoutes , { prefix : '/attempts' } ) ;
  return app;
}
