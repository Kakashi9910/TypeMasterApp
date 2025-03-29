const router = require('express').Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');

// Store new typing session
router.post('/', auth, async (req, res) => {
    try {
        const session = new Session({
            ...req.body,
            userId: req.user.userId
        });
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's session history
router.get('/user', auth, async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get session analysis
router.get('/analysis/:sessionId', auth, async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.sessionId,
            userId: req.user.userId
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Calculate insights
        const insights = {
            averageWPM: session.wpm,
            accuracy: session.accuracy,
            commonErrors: session.errorWords,
            typingPattern: {
                averageDuration: session.typingDurations.reduce((a, b) => a + b, 0) / session.typingDurations.length,
                slowestWords: session.typingDurations
                    .map((duration, index) => ({ duration, word: session.text.split(' ')[index] }))
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 5)
            },
            psychologicalInsights: {
                impulsivity: session.wpm > 60 && session.accuracy < 90 ? 'High' : 'Low',
                resilience: session.typingDurations.reduce((acc, curr, idx) => 
                    idx > 0 ? Math.abs(curr - session.typingDurations[idx-1]) : 0
                ) / session.typingDurations.length
            }
        };

        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;