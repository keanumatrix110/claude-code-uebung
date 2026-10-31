"""Post-process: fade transitions, video autoplay, staggered 'fade up' entrance animations.
Shapes named a<N>_* fade in as group N (groups in ascending order, auto-start, staggered)."""
import re, sys, zipfile, shutil, html
from collections import defaultdict

SRC, DST = sys.argv[1], sys.argv[2]
import json
ALT = json.load(open("/tmp/deck/alts.json"))

GROUP_GAP = 260   # ms between groups
DUR = 550         # ms per effect

class Ids:
    def __init__(self): self.n = 0
    def __call__(self): self.n += 1; return self.n

def effect(nid, spid, delay, node_type):
    a, b, c, d = nid(), nid(), nid(), nid()
    return (f'<p:par><p:cTn id="{a}" presetID="42" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="{node_type}">'
            f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
            f'<p:set><p:cBhvr><p:cTn id="{b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:to><p:strVal val="visible"/></p:to></p:set>'
            f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{c}" dur="{DUR}"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
            f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{d}" dur="{DUR}" decel="100000" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
            f'<p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:tavLst><p:tav tm="0"><p:val><p:strVal val="#ppt_y+.03"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="#ppt_y"/></p:val></p:tav></p:tavLst></p:anim>'
            f'</p:childTnLst></p:cTn></p:par>')

def media_play(nid, spid):
    a, b = nid(), nid()
    return (f'<p:par><p:cTn id="{a}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            f'<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="{b}" dur="9000" fill="hold"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>')

def build_timing(slide_xml):
    shapes = re.findall(r'<p:(sp|pic)>\s*<p:nv(?:Sp|Pic)Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"', slide_xml)
    groups = defaultdict(list); video = None; sp_ids = []
    for kind, sid, name in shapes:
        if name == "video": video = sid; continue
        m = re.match(r'a(\d+)_', name)
        if m:
            groups[int(m.group(1))].append(sid)
            if kind == "sp": sp_ids.append(sid)
    if not groups and not video: return None
    nid = Ids(); root, seq, outer, inner = nid(), nid(), nid(), nid()
    effects = []
    if video:
        effects.append(media_play(nid, video))
    first = not video
    for gi, g in enumerate(sorted(groups)):
        for sid in groups[g]:
            effects.append(effect(nid, sid, gi * GROUP_GAP + 150, "afterEffect" if first else "withEffect"))
            first = False
    xml = (f'<p:timing><p:tnLst><p:par><p:cTn id="{root}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
           f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{seq}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
           f'<p:par><p:cTn id="{outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/>'
           f'<p:cond evt="onBegin" delay="0"><p:tn val="{seq}"/></p:cond></p:stCondLst><p:childTnLst>'
           f'<p:par><p:cTn id="{inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
           + "".join(effects) +
           '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn>'
           '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
           '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>')
    if video:
        v1 = nid()
        xml += (f'<p:video><p:cMediaNode vol="80000" mute="1"><p:cTn id="{v1}" fill="hold" display="0">'
                f'<p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn>'
                f'<p:tgtEl><p:spTgt spid="{video}"/></p:tgtEl></p:cMediaNode></p:video>')
    xml += '</p:childTnLst></p:cTn></p:par></p:tnLst>'
    if sp_ids:
        xml += '<p:bldLst>' + "".join(f'<p:bldP spid="{s}" grpId="0" animBg="1"/>' for s in sp_ids) + '</p:bldLst>'
    xml += '</p:timing>'
    return xml

TRANS = '<p:transition spd="slow"><p:fade/></p:transition>'

zin = zipfile.ZipFile(SRC)
zout = zipfile.ZipFile(DST, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    if re.fullmatch(r'ppt/slides/slide\d+\.xml', item.filename):
        s = data.decode("utf-8")
        num = re.search(r'slide(\d+)\.xml', item.filename).group(1)
        if num in ALT:
            s = s.replace('name="video">', 'name="video" descr="%s">' % html.escape(ALT[num], quote=True), 1)
        timing = build_timing(s) or ""
        s = s.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + TRANS + timing, 1)
        data = s.encode("utf-8")
    zout.writestr(item, data)
zout.close()
print("animated ->", DST)
