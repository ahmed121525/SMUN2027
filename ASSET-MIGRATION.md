# Asset migration notes

The source branch contained several raster assets larger than the 1 MB per-file binary retrieval limit exposed by the connected GitHub file API. The React app has lightweight, branded SVG stand-ins for the actively referenced oversized files so the layout remains intact.

Stand-ins created:
- People: Aalokik Dingwani, Sankalp Chauhan, Shadan Husham, Abhirup Chatterjee.
- Committee marks: Mikhail Gorbachev's Cabinet, IPL Auction, Lok Sabha, International Press Corps.
- Branding placeholders: SMUN 26 logo variants 04–06.

Original oversized files that still need a manual upload if exact visual fidelity is required:
- `SMUN 26 LOGOS-4.png`
- `SMUN 26 LOGOS-5.png`
- `SMUN 26 LOGOS-6.png`
- `aalokik dingwani.png`
- `l1.png`
- `l2.png`
- `l4.png`
- `l5.png`
- `sankalp chauhan.jpg`
- `shadan.JPG`
- `x1.png`

All other eligible public assets were copied as binary Git blobs and checked against their original source SHA.
