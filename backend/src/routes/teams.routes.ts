import { Router } from "express";
import { TeamService } from "../services/team.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { auditMiddleware } from "../middleware/audit.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: any, res, next) => {
  try {
    const teams = await TeamService.getTeams(req.user.id);
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
});

router.post("/", auditMiddleware, async (req: any, res, next) => {
  try {
    const team = await TeamService.createTeam(req.user.id, req.body.name, req.body.description);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/invite", auditMiddleware, async (req: any, res, next) => {
  try {
    await TeamService.inviteMember(req.params.id, req.user.id, req.body.email, req.body.role);
    res.json({ success: true, message: "Invite sent" });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: any, res, next) => {
  try {
    const team = await TeamService.getTeam(req.params.id, req.user.id);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auditMiddleware, async (req: any, res, next) => {
  try {
    const team = await TeamService.updateTeam(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auditMiddleware, async (req: any, res, next) => {
  try {
    await TeamService.deleteTeam(req.params.id, req.user.id);
    res.json({ success: true, message: "Team deleted" });
  } catch (err) {
    next(err);
  }
});

router.put("/:id/members/:userId", auditMiddleware, async (req: any, res, next) => {
  try {
    await TeamService.changeMemberRole(req.params.id, req.user.id, req.params.userId, req.body.role);
    res.json({ success: true, message: "Role updated" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/members/:userId", auditMiddleware, async (req: any, res, next) => {
  try {
    await TeamService.removeMember(req.params.id, req.user.id, req.params.userId);
    res.json({ success: true, message: "Member removed" });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/agents", async (req: any, res, next) => {
  try {
    const agents = await TeamService.getTeamAgents(req.params.id, req.user.id);
    res.json({ success: true, data: agents });
  } catch (err) {
    next(err);
  }
});

export default router;
