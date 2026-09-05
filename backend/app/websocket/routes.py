from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager

router = APIRouter()

@router.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Initial handshake message
        await websocket.send_json({
            "event": "connected",
            "message": "Connected to Nepal Stock Market Intelligence Realtime Feed",
            "status": "online"
        })
        while True:
            # Keep connection alive receiving heartbeats or client messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
