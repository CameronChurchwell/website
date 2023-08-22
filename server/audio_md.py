"""An extension to markdown to allow for audio"""

import re
from markdown.blockprocessors import BlockProcessor
from markdown.extensions import Extension
import xml.etree.ElementTree as etree

audio_pattern = r'~\[(.*)\]\((.*)\)'

class AudioProcessor(BlockProcessor):
    """Preprocessor for custom markdown audio syntax"""

    def test(self, parent, block):
        return re.match(audio_pattern, block) is not None

    def run(self, parent, blocks):
        block = blocks.pop(0)
        groups = re.match(audio_pattern, block).groups()

        alternate = groups[0]
        resource = groups[1]
        el = etree.Element('audio', {'controls': 'true'})
        el.append(etree.Element('source', {'src': resource}))
        el.text = alternate
        # return f"<audio controls><source src={resource}>{alternate}</audio>", m.start(0), m.end(0)
        print(etree.tostring(el))
        parent.append(el)

class Audio(Extension):
    
    def extendMarkdown(self, md):
        md.registerExtension(self)
        md.parser.blockprocessors.register(AudioProcessor(md.parser), 'Audio', 10000)
