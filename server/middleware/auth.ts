import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = "bus-operations-secret";

export type UserRole = "manager" | "garage_supervisor";

type AuthenticatedUser = {
	userId: number;
	username: string;
	role: UserRole;
};

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}

export const authenticateUser = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authorization = req.headers.authorization;

	if (!authorization) {
		return res.status(401).json({
			error: "Authentication required",
		});
	}

	const token = authorization.startsWith("Bearer ")
		? authorization.slice(7)
		: null;

	if (!token) {
		return res.status(401).json({
			error: "Invalid authorization header",
		});
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		if (
			typeof decoded !== "object" ||
			decoded === null ||
			typeof decoded.userId !== "number" ||
			typeof decoded.username !== "string" ||
			(decoded.role !== "manager" && decoded.role !== "garage_supervisor")
		) {
			return res.status(401).json({
				error: "Invalid token payload",
			});
		}

		req.user = {
			userId: decoded.userId,
			username: decoded.username,
			role: decoded.role,
		};

		next();
	} catch {
		return res.status(401).json({
			error: "Invalid or expired token",
		});
	}
};

export const requireRole = (...allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				error: "Authentication required",
			});
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				error: "Insufficient permissions",
			});
		}

		next();
	};
};
