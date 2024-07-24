nodoku-core is a foundation library for the nodoku static site generator, 
a Node JS - React based framework for fast page prototyping using yaml files as content and page config
The site in Nodoku is composed of two yaml files - visual and content.

# getting started

in order to use nodoku one needs to install the nodoku-core library (this one)
and at least one component library for nodoku (for example, nodoku-flowbite)


```shell
npm install nodoku-core nodoku-flowbite
```

Then the rendering component would be as follows:

```tsx
<RenderingPage 
    pageName={"main"}
    lng={lng}
    contentYamlProvider={contentYamlProvider}
    visualYamlProvider={visualYamlProvider}
    i18nextProvider={i18nextProvider}
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

