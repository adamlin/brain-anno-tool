BrainAnnoTool is a solution for pixel and cell based annotation tool for fast labeling. The image was serverd using Djatoka tiling server and serve JP2000 images from backend. 

What's New

1. Using tiling server to serve image without cropping. 
2. Includes more features such as:
	- cell annotation: (1). add, delete, modify cells in world-map coordidated bases. (2). group cell for fast labeling. (3). save as geojson with tracking lables (add, delete). (4). divide tracer channel.
	- pixel annotation: (1). add, detete, modify process in pixel value. (2). auto divide image into (1024 by 1024) tiles withtout corpping. (3). read mask fiile and convert to pixel value (4). save as geojson as an annotated section. (5). divide channel, tracer, processes, cell type etc ....


<img src="https://github.com/adamlin/annotation_tool/blob/master/images/cell_annotation_example.png">
<img src="https://github.com/adamlin/annotation_tool/blob/master/images/pixel_annotation_example.png">
In order to access the dataset with url, this is example:

cell annotation
http://localhost/annotation_tool/ol_cshl_anno.html?brain_id=1159&label=F&pid=/brainimg/brainimage.jp2&color=R&annot_brain_id=1&session_id=testingfromadamlin2020

pixel annotation
http://localhost/annotation_tool/pixel.html?brain_id=1159&type=F&section=90&category=process&tracer=red&annot_brain_id=1&session_id=testingfromadamlin2020

post stable release of this tool : 

1. integration into mouse viewer
2. integration into offline viewer
3. addition of features such as segmentation, object identification and labled counting.


Installation

Our BrainAnnoTool has step by step instructions to install on apache2 web server.

Requirements

- Linux or macOS with php > 7.2
- Apache/2.4.29
- Djatoka tiling server (adore-djatoka-1.1) (https://wiki.lyrasis.org/display/ISLANDORA717/Djatoka)
- IIP image server (https://iipimage.sourceforge.io/documentation/server/) - other solution

Download BrainAnnoTool from Source