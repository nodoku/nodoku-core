<!-- TOC -->
* [Nodoku foundation](#nodoku-foundation)
  * [Nodoku content flow](#nodoku-content-flow)
  * [Nodoku skin](#nodoku-skin)
* [Getting started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Integrating Nodoku into a project](#integrating-nodoku-into-a-project)
* [generation scripts](#generation-scripts)
<!-- TOC -->

Nodoku is a static site generator, where the content is provided via MD (markdown) files, and the visual representation is controlled using Yaml files - called _skin_.

Nodoku promotes the content-first approach, when the content creation process is not being distracted by the consideration related to the visual representation and design.

Instead, the content is created first as a MD file, demarcated by the special markers into content blocks, and then each bloc is rendered using the configuration provided in a Yaml file called _skin_.

Figure 1 shows a screenshot of a part of a landing page created with Nodoku.

<figure>
  <img
    src="./docs/nodoku-way-card-screenshot.png"
    alt="Nodoku landing page part with 3 cards"
    title="Nodoku landing page part with 3 cards"
  />
  <figcaption>
    <b>Figure 1</b>: A part of a landing page, created using Nodoku.
It has 3 cards, organized in a row, where the content of each card is supplied by an MD file. The mapping between content and visual representation is configured in a Yaml file.
  </figcaption>
</figure>



Nodoku is a set of libraries, the most important of which is nodoku-core, intended to be used with the **_NextJS_** framework for generation of static sites.

nodoku-core doesn't contain the visual representation for content blocks. Instead, the visual representation is supplied via separated dependencies, such as **_nodoku-flowbite_** (components based on [Flowbite](https://flowbite.com/docs/getting-started/introduction/)) and **_nodoku-mambaui_** (components based on [MambaUI](https://mambaui.com/components/hero)).

More set of components can be added, and included in the project as required.

The structure of the skin files is organized by rows, each row having one or more components.

The mapping between visual representation and the content block is performed using the concept of _selector_. Selector is a set of matching conditions, attached to a visual component in the skin Yaml file. 

The actual rendering is performed in two steps:
- first, for a given visual component a set of matching content blocks is determined, using the selector and the meta-data of the content block
- second, this flow of content blocks is provided to the rendering mechanism of the visual component for actual rendering.

This decoupling allows for great level of flexibility and reuse between the content and the visual representation.

If the visual components support [Tailwind](https://tailwindcss.com/docs/installation), the Tailwind customization can be provided in the skin Yaml file to fine tune the visual representation. 

You can learn more about the rationale behind Nodoku and the main principles in the blog article: [Nodoku: a lo-code static site generator, promoting a content-first approach based on Markdown files](https://epanikas.hashnode.dev/nodoku-a-lo-code-static-site-generator-promoting-a-content-first-approach-based-on-markdown-files)

# Nodoku foundation

Nodoku is organized around two flow of data: 
- the content flow (supplied via a Markdown file)
- the visual representation flow (supplied via Yaml file called _skin_)

The Nodoku engine will take care of parsing these files and supply them to the designated visual components for rendering.

## Nodoku content flow

As has been mentioned above, the Nodoku content flow is supplied via a MD file.

The content flow in Nodoku is organized around an entity called _content block_, which is a single piece of content suitable for rendering by a Nodoku visual component. The set of such components constitute the Nodoku content flow. 

The content block has a predefined structure, and designed to be a universal and visual representation agnostic. In particular this is important to implement the _content-first_ principle, where the content can (and should!) be created first, without any visual design considerations.

Nodoku engine parses the MD file to extract the set of content blocks, that are contained in such file. The content blocks are delimited by a special markers - the content block delimiters.

The content block delimiter is a small piece of Yaml code snippet, embedded directly into the MD file. 

For example, the content, that has been used to generate the screeshnot on Figure 1 is the following:

```markdown

```yaml
nd-block:
  attributes:
    sectionName: nodoku-way
``

# Step 1: _Think_
## Create content promoting your product or service as an **MD file**
...
Concentrate on the subject of your product / service to highlight its advantages.
...
|Get started|

# Step 2: _Skin_
## Skin the MD file using simple **Yaml config** and available components
...
Once you are happy with the message your landing page conveys,
start by skinning it up.
...
|Get started|

# Step 3: _Fine tune_
## Use configuration options to fine tune your landing page presentation
...
If the default presentation doesn't suit your needs, you can tweak it up
using the config options of each component to fine tune it for your needs.
...
|Get started|

```

The first thing one would notice in this MD excerpt is the small Yaml code snippet.

```yaml
nd-block:
  attributes:
    sectionName: nodoku-way
```

This Yaml code snippet is a content block delimiter, and it contains the content block meta-data, such as id, attributes and tags.

The schema for this Yaml code snippet can be found in the Json schema file : **_nodoku-core/docs/md-content-block-delimiter.json_**

The content block has the following predefined, fixed structure:
```typescript
class NdTranslatedText {
    // this class represents a piece of text, that can be used for i18next translation (see below)
    ...
}

class NdContentBlock {
    
    // several fields containing the content block metadata
    ...
    
    title?: NdTranslatedText;       // a title
    subTitle?: NdTranslatedText;    // a subtitle
    h3?: NdTranslatedText;          // h3 header
    h4?: NdTranslatedText;          // h4 header
    h5?: NdTranslatedText;          // h5 header
    h6?: NdTranslatedText;          // h6 header
    footer?: NdTranslatedText;      // footer
    paragraphs: NdTranslatedText[]; // set of paragraphs
    bgImageUrl?: NdTranslatedText;  // background image 
    images: NdContentImage[] = [];  // set of images 
}
```

As one can see, the content block _cannot_ contain more than instance of each type of headers: title (h1), subtitle (h2), h3, etc.

But it _can_ contain several headers of different types, for example, a title (h1) and subtitle (h2)

> Hence, the parsing of the MD file goes as follows:
> - if the Yaml nd-block is encountered, a new content block is started, which would absord all the content elements that are discovered below, until a new content block is started
> - if a header (of any kind) is encountered
>   - if a header of the same kind or below exists in the current block
>     - start a new block, and copy the metadata from the current block to the new one
>   - otherwise
>     - add the corresponding header to the current block

This approach allows for smooth content definition, where a common content block metadata is defined only once, and all the subsequent pieces of content are treated as new blocks with the same metadata.

Thanks to this approach to parsing, the excerpt of the MD file, shown above, defines 3 content blocks - one per card shown on the screenshot of Figure 1 - instead of only one.  


## Nodoku skin

Nodoku skin is a Yaml file which configures the visual representation of the content defined in a markdown file.

The Nodoku page layout is organized as a set of rows, each row having its configured set of components.

Each layout row can have one or more visual components.

Here is an example of a typical Nodoku skin file:

```yaml
rows:
  - row:
      components:
        - mambaui/card:
            selector:
              attributes:
                sectionName: nodoku-way
```

In this example, we define a row containing components of type _mambaui/card_

The selector defines the content blocks that should be rendered using this visual component. In our case, these are all the content blocks having an attribute `sectionName` equal to `nodoku-way`.

Recall, that according to our MD file we are actually having 3 of those: 
- Step 1: _Think_
- Step 2: _Skin_
- Step 3: _Fine tune_

And naturally one single card component cannot display more than one content block.

Consequently, according to the skin Yaml file, the Nodoku engine will apply the same visual component definition to all the 3 matching content blocks. 

And this process will end up rendering the screenshot presented on Figure 1.

It's worth noting that a visual component can support arbitrary number of content blocks. For example, the _flowbite/carousel_ component can display any number of content blocks.

Consequently, if the skin Yaml file had the following configuration:
```yaml
rows:
  - row:
      components:
        - flowbite/carousel:
            selector:
              attributes:
                sectionName: nodoku-way
```

it would have had the following representation:

<figure>
  <img
    src="./docs/nodoku-way-carousel-screenshot.png"
    alt="Nodoku landing page part with carousel"
    title="Nodoku landing page part with carousel"
  />
  <figcaption>
    <b>Figure 2</b>: Three content blocks, rendered as the carousel component.
  </figcaption>
</figure>



# Getting started

## Prerequisites

As has been mentioned above, Nodoku is a library intended to be used within the NextJS framework. The creation of a NextJS project is out of scope for the current documentation.

We assume that the user is already familiar with the following concepts:
- NextJS framework 
- Typescript
- Tailwind
- React and Tsx files (JSX for Typescript)
- certain familiarity with Webpack config

## Installation
In order to use nodoku one needs to install the nodoku-core library (this one) and at least one component library for Nodoku (for example, nodoku-flowbite)


```shell
npm install nodoku-core nodoku-flowbite
```

## Integrating Nodoku into a project

The entry point of a Nodoku library is the **_RenderingPage_** component.

This component receives as properties the flow of content blocks and the skin, and renders accordingly.

Here is a typical example of the usage of the RenderingPage TSX component:

```tsx

// load and parse the content MD file
const content: NdContentBlock[] = await contentMarkdownProvider("<url location of the content file>.md", "en", "nodoku-landing")

// load the Yaml skin file
const skin: NdPageSkin = await skinYamlProvider("<url location of the skin file>.yaml")

...

<RenderingPage
        lng={lng}
        renderingPriority={RenderingPriority.skin_first}
        skin={skin}
        content={content}
        componentProvider={defaultComponentProvider}
/>
```




where:
- **_pageName_**: the name of the page to be rendered. This name is given to the visualYamlProvider funtion to fetch the required page layout yaml file

- **_lng_**: the page language for localization. This parameter is given further to the contentYamlProvider to fetch the content on the given language

- **_contentYamlProvider_**: function providing the textual content for the page. This function is expected to fetch the content yaml file and return its content as text for the further processing. the function signature is the following: ```(lng: string, ns: string) => Promise<string>```

- **_visualYamlProvider_**: function providing the content of a yaml file that is used to render the page - the page structure yaml file. This function is expected to fetch the content yaml file and return its content as text for the further processing. the function signature is the following: ```(pageName: string) => Promise<string>```

- **_i18nextProvider_**: the page localization provider. The signature is the following: ```(lng: string) => Promise<{t: (key: string, ns: string) => string}>```. For a given language the localization provider is supposed to return a function, that would provide the value for a given key and namespace

- **_componentProvider_**: the function returning an actual implementation of the component, given its name, as specified in the page structure - visual yaml file. The signature is as follows: ```(componentName: string) => Promise<AsyncFunctionComponent>```, where AsyncFunctionComponent is the following function: ```(props: LbComponentProps) => Promise<JSX.Element>```

# generation scripts
to simplify the development, the nodoku-core provides the following scripts, that are used to generate component resolver, content schema and visual schema, by scanning the **node_modules** folder of the project
- **nodoku-gen-component-resolver**: generates the component resolver by scanning node_modules and searching for nodoku component libraries - the libraries providing the nodoku.manifest.json file
- **nodoku-gen-content-schema**: generates the json schema file that can be used to validate the **content** yaml file
- **nodoku-gen-visual-schema**: generates the json schema file thate can be used to validate the **visual** page yaml file 

