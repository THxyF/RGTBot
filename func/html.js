let saeTagList = [
  "br",
  "img",
  "hr",
  "meta",
  "input",
  "embed",
  "area",
  "base",
  "col",
  "keygen",
  "link",
  "param",
  "source"
];
let aeTagList = [
  "li",
  "dt",
  "dd",
  "p",
  "tr",
  "td",
  "th",
  "rt",
  "rp",
  "optgroup",
  "option",
  "thread",
  "tfoot"
];

class HTMLData {
  constructor(src) {
    this.src = src.replace("\n", "").replace("\t", "");
    this.elements = [];
    this.generalElements = [];
    this.generalTags = [];
    this.tags = [];
    this.index = 0;
  }

  async analyze() {
    let buf = "";
    while (this.index < this.src.length) {
      if (this.src[this.index] === "<") {
        buf = this.getStrtoChar(">");
        ++this.index;

        if (buf.slice(1, 4) === "!--") {
          buf = "";
          continue;
        }
        await this.addTag(buf).analyze();

        buf = "";
      } else {
        buf = this.getStrtoChar("<");
        if (buf[buf.length - 1] === "<") buf = buf.slice(0, buf.length - 1);

        this.generalElements.push(buf);
        buf = "";
      }
    }

    return this;
  }

  getStrtoChar(char) {
    let res = "";
    while (this.index < this.src.length) {
      res += this.src[this.index];
      if (this.src[this.index] === char) break;
      ++this.index;
    }
    return res;
  }

  addTag(src) {
    let newTag = new HTMLTag(this, undefined, src);

    this.tags.push(newTag);
    this.generalTags.push(newTag);

    return newTag;
  }

  toString() {
    let out = "";
    out += this.generalElements
      .map(el => {
        if (typeof el === "string") return el;
        else return el.toString();
      })
      .join("");

    return out;
  }
}

class HTMLTag {
  constructor(data, parent, src) {
    this.src = src;
    this.type = "unknown";
    this.parent = parent;
    this.element;
    this.data = data;
    this.name = "";
    this.attributes = [];
  }

  async analyze() {
    if (this.src[0] !== "<" || this.src[this.src.length - 1] !== ">") {
      this.type = "Error";
      return -1;
    } else if (this.src[1] === "/") {
      this.type = "end";
      return 0;
    } else if (this.src[this.src.length - 2] === "/") {
      this.type = "startAndEnd";
    } else this.type = "start";

    this.name = this.src.match(/[^<\s>]*/g).find(m => m.length > 0);
    let list = this.src.match(/[^\s>]*?=(".*?"|[^\s>]*)/g);
    if (list !== null) {
      list.forEach(s => {
        this.addAtb(s).analyze();
      });
    }

    if (saeTagList.includes(this.name)) this.type = "startAndEnd";
    if (aeTagList.includes(this.name)) this.type = "autoEnd";

    return await this.setElement().analyze();
  }
  addAtb(src) {
    let newAtb = new HTMLAttribute(this, src);

    this.attributes.push(newAtb);
    return newAtb;
  }
  setElement() {
    let newElem = new HTMLElement(this);

    this.element = newElem;
    this.data.elements.push(newElem);
    if (this.parent === undefined) this.data.generalElements.push(newElem);
    return newElem;
  }
}

class HTMLAttribute {
  constructor(tag, src) {
    this.src = src;
    this.tag = tag;
    this.name = "";
    this.value = "";
  }

  async analyze() {
    this.name = this.getName();
    this.value = this.getValue();

    return 0;
  }

  getName() {
    let res = "",
      i = 0;
    while (i < this.src.length) {
      if (this.src[i] === "=") break;
      res += this.src[i];
      ++i;
    }
    return res;
  }
  getValue() {
    let res = "",
      i = this.src.indexOf("=") + 1;

    if (this.src[i] === '"')
      res = this.src.slice(i + 1, this.src.length - 1).split(" ");
    else res = Number(this.src.slice(i, this.src.length));
    return res;
  }
  toString() {
    let out = this.name + ":" + this.value;

    return out;
  }
}

class HTMLElement {
  constructor(startTag) {
    this.parent = startTag.parent;
    this.startTag = startTag;
    this.data = startTag.data;
    this.name = startTag.name;
    this.attributes = startTag.attributes;
    this.elements = [];
    this.depth = this.parent === undefined ? 1 : this.parent.depth + 1;
  }

  async analyze() {
    let buf = "",
      res = {};
    if (this.startTag.type === "startAndEnd") return this;
    while (this.data.index < this.data.src.length) {
      if (this.data.src[this.data.index] === "<") {
        buf = this.data.getStrtoChar(">");
        ++this.data.index;

        if (this.startTag.type === "autoEnd") {
          if (
            !new RegExp(`</${this.name}(| .*)>`, "g").test(buf) &&
            this.elements.length > 1
          ) {
            this.data.index -= buf.length;
            return this;
          }
        } else if (buf.slice(1, 4) === "!--") {
          buf = "";
          continue;
        }

        res = await this.newTag(buf).analyze();

        if (res === 0) return this;
        else if (res === -1) return -1;
        else this.elements.push(res);

        buf = "";
      } else {
        buf = this.data.getStrtoChar("<");
        if (buf[buf.length - 1] === "<") buf = buf.slice(0, buf.length - 1);

        this.addTextE(buf);
        buf = "";
      }
    }
  }

  newTag(src) {
    let newTag = new HTMLTag(this.data, this, src);

    this.data.tags.push(newTag);
    return newTag;
  }

  toString() {
    let out = "";

    for (let i = 0; i < this.depth; ++i) out += "-";
    out += this.name;
    if (this.attributes.length > 0) {
      out += "[" + this.attributes.map(a => a.toString()).join(",") + "]";
    }

    out += "\n";
    if (this.elements.length > 0) {
      out += this.elements.map(e => e.toString()).join("");
    }

    return out;
  }

  addTextE(str) {
    str = str.replace(/^[\s　\uFEFF\xA0]+|[\s　\uFEFF\xA0]+$/g, "");
    if (str.length > 0) this.elements.push(new HTMLText(str, this));
  }
}

class HTMLText {
  constructor(str, parent) {
    this.parent = parent;
    this.data = parent.data;
    this.name = str;
    this.depth = this.parent === undefined ? 1 : this.parent.depth + 1;
  }

  toString() {
    let out = "";
    for (let i = 0; i < this.depth; ++i) out += "-";
    return out + '"' + this.name + '"\n';
  }
}
