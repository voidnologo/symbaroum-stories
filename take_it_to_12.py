import urllib.request, json, time, random, shutil
from pathlib import Path

API = "http://localhost:8188"
COMFY_OUT = Path("/home/void/AI/ComfyUI/output")
STAGING = Path("/home/void/projects/transcribe/artwork/output/scenes")
STAGING.mkdir(parents=True, exist_ok=True)

OPEN = (
    "Japanese ink-wash painting style illustration. Visible brushstrokes and ink splatter effects. "
    "Dark fantasy tone. Limited color palette.\n\n"
)

CLOSE = (
    "\n\nPainted with confident brushwork and controlled ink splatter. Transparent background fading to "
    "nothing at the edges. Calligraphic line quality with thick-to-thin variation. Some areas dissolve "
    "into raw ink marks. Symbaroum dark fantasy setting. Cinematic wide composition."
)

NEGATIVE = "low quality, deformed, extra limbs, bad hands"

CORE = ""

SETTING = ""


VARIANTS = [
    ("name_var01", "description" + SETTING),
]


def build(prompt_text, negative_text, seed, prefix):
    return {
        "unet_loader": {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": "flux1-dev.safetensors", "weight_dtype": "fp8_e4m3fn"},
        },
        "clip_loader": {
            "class_type": "DualCLIPLoader",
            "inputs": {
                "clip_name1": "t5xxl_fp16.safetensors",
                "clip_name2": "clip_l.safetensors",
                "type": "flux",
            },
        },
        "vae_loader": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "lora_0": {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["unet_loader", 0],
                "lora_name": "nistyle_manga_sketch_flux.safetensors",
                "strength_model": 0.75,
            },
        },
        "lora_1": {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["lora_0", 0],
                "lora_name": "dark_chiaroscuro_lighting_flux.safetensors",
                "strength_model": 0.45,
            },
        },
        "lora_2": {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["lora_1", 0],
                "lora_name": "fantasy_impressions_flux.safetensors",
                "strength_model": 0.50,
            },
        },
        "clip_encode": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": prompt_text, "clip": ["clip_loader", 0]},
        },
        "clip_encode_neg": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": negative_text, "clip": ["clip_loader", 0]},
        },
        "empty_latent": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": 1024, "height": 704, "batch_size": 1},
        },
        "noise": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed}},
        "sampler_select": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "euler"}},
        "scheduler": {
            "class_type": "BasicScheduler",
            "inputs": {"scheduler": "simple", "steps": 35, "denoise": 1.0, "model": ["lora_2", 0]},
        },
        "guider": {
            "class_type": "BasicGuider",
            "inputs": {"model": ["lora_2", 0], "conditioning": ["clip_encode", 0]},
        },
        "guider_neg": {
            "class_type": "BasicGuider",
            "inputs": {"model": ["lora_2", 0], "conditioning": ["clip_encode_neg", 0]},
        },
        "sampler": {
            "class_type": "SamplerCustomAdvanced",
            "inputs": {
                "noise": ["noise", 0],
                "guider": ["guider", 0],
                "sampler": ["sampler_select", 0],
                "sigmas": ["scheduler", 0],
                "latent_image": ["empty_latent", 0],
            },
        },
        "vae_decode": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["sampler", 0], "vae": ["vae_loader", 0]},
        },
        "save_image": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": prefix, "images": ["vae_decode", 0]},
        },
    }


def queue(workflow):
    payload = json.dumps({"prompt": workflow}).encode()
    req = urllib.request.Request(f"{API}/prompt", data=payload, headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req).read())["prompt_id"]


jobs = {}
for prefix, body in VARIANTS:
    prefix += f'_{int(time.time())}'
    text = OPEN + body + CLOSE
    seed = random.randint(1, 2**40)
    pid = queue(build(text, NEGATIVE, seed, prefix))
    jobs[pid] = prefix
    print(f"queued {prefix}  seed={seed}  pid={pid}", flush=True)

done = {}
while len(done) < len(jobs):
    time.sleep(5)
    q = json.loads(urllib.request.urlopen(f"{API}/queue").read())
    active = set([x[1] for x in q.get("queue_running", [])] + [x[1] for x in q.get("queue_pending", [])])
    for pid in list(jobs.keys()):
        if pid not in active and pid not in done:
            hist = json.loads(urllib.request.urlopen(f"{API}/history/{pid}").read())
            files = []
            for node_out in hist[pid]["outputs"].values():
                if "images" in node_out:
                    files += [img["filename"] for img in node_out["images"]]
            done[pid] = files
            print(f"  done {jobs[pid]}: {files}", flush=True)

copied = []
for pid, files in done.items():
    for fn in files:
        src = COMFY_OUT / fn
        if src.exists():
            shutil.copy2(src, STAGING / fn)
            copied.append(fn)
print("COPIED:", copied, flush=True)
print("ALL DONE", flush=True)
