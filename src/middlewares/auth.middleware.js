import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// JWT 검증 미들웨어
// 인증이 필요한 라우터에 verifyToken을 추가하면 req.user에 유저 정보가 주입됩니다.
export const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: '인증 토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, username }
        next();
    } catch (error) {
        return res.status(403).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
    }
};

// 인증 선택적 미들웨어 — 비밀글 조회 등 로그인 여부에 따라 다른 응답
export const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (_) {
            // 토큰이 잘못됐어도 통과 (req.user = undefined)
        }
    }
    next();
};

// 하위 호환 alias
export const verifyToken = authenticate;
