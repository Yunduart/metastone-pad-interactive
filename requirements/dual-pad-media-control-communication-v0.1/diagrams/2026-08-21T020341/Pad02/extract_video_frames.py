import csv
import json
from pathlib import Path

import cv2
import numpy as np


HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
CSV_PATH = Path(r"D:\FOR_WORK\260818_MetaStone\10_成果案例与产品介绍_整合_20260821\00_交付总览\01_素材总清单.csv")


def fit_16x9(frame, width=480, height=270):
    h, w = frame.shape[:2]
    scale = min(width / w, height / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_AREA)
    canvas = np.full((height, width, 3), 245, dtype=np.uint8)
    x = (width - nw) // 2
    y = (height - nh) // 2
    canvas[y:y + nh, x:x + nw] = resized
    return canvas


def safe_name(asset_id):
    return asset_id.lower().replace("p02-", "").replace("_", "-") + "-frame.png"


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    targets = [
        row for row in rows
        if row["Pad"] == "Pad02"
        and row["类型"] == "MP4"
        and row["素材ID"] != "P02-EXCLUDED-07"
    ]

    report = []
    for row in targets:
        src = Path(row["绝对路径"])
        if not src.exists():
            raise FileNotFoundError(src)

        cap = cv2.VideoCapture(str(src))
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0)
        frame_count = float(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        duration = frame_count / fps if fps > 0 else 0
        if row["素材ID"] == "P02-CAND-EXPERIENCE" and duration >= 41.0:
            sample_sec = 40.0
        else:
            sample_sec = 20.0 if duration >= 21.0 else max(0.0, duration * 0.5)
        cap.set(cv2.CAP_PROP_POS_MSEC, sample_sec * 1000)
        ok, frame = cap.read()
        if not ok:
            cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, int(frame_count * 0.5)))
            ok, frame = cap.read()
        cap.release()
        if not ok or frame is None:
            raise RuntimeError(f"Could not decode representative frame: {src}")

        out_name = safe_name(row["素材ID"])
        out_path = ASSETS / out_name
        image = fit_16x9(frame)
        ok_encode, encoded = cv2.imencode(".png", image)
        if not ok_encode:
            raise RuntimeError(f"Could not encode {out_path}")
        encoded.tofile(str(out_path))

        report.append({
            "id": row["素材ID"],
            "file": row["文件名"],
            "source_path": str(src),
            "frame_file": out_name,
            "sample_sec": round(sample_sec, 3),
            "duration_sec": round(duration, 3),
            "width": int(frame.shape[1]),
            "height": int(frame.shape[0]),
        })

    (HERE / "video-frames.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps({"ok": True, "frames": len(report), "report": str(HERE / "video-frames.json")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
