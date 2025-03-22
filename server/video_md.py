"""An extension to markdown to allow for video"""

import re
from markdown.blockprocessors import BlockProcessor
from markdown.extensions import Extension
import xml.etree.ElementTree as etree

video_pattern = r'@\[(.*)\]\((.*)\)'

class VideoProcessor(BlockProcessor):
    """Preprocessor for custom markdown video syntax"""

    def test(self, parent, block):
        return re.match(video_pattern, block) is not None

    def run(self, parent, blocks):
        block = blocks.pop(0)
        groups = re.match(video_pattern, block).groups()

        alternate = groups[0]
        resource = groups[1]
        el = etree.Element('video', {'controls': 'true', 'width': '500'})
        el.append(etree.Element('source', {'src': resource}))
        el.text = alternate
        # return f"<audio controls><source src={resource}>{alternate}</audio>", m.start(0), m.end(0)
        print(etree.tostring(el))
        parent.append(el)

class Video(Extension):
    def extendMarkdown(self, md):
        md.registerExtension(self)
        md.parser.blockprocessors.register(VideoProcessor(md.parser), 'Video', 10001)
