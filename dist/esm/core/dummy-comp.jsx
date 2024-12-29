import { NdCode, NdTranslatableText } from "../content/nd-content";
import { NdLink } from "../content/nd-content";
export async function DummyComp(props) {
    // console.log("content dummy comp", props.theme)
    const { content, i18nextTrustedHtmlProvider, lng, rowIndex, componentIndex } = props;
    const { t } = await i18nextTrustedHtmlProvider(lng);
    return <div>{await render(rowIndex, componentIndex, content[0], t)}</div>;
}
async function render(rowIndex, componentIndex, block, t) {
    console.log("this is my block", block.callToActions.map(cta => `${cta.ctaUrl.key}`));
    return (<div className={"w-full w-full flex flex-col items-left justify-left  border border-4 border-red-200 relative pb-10"}>
            <div className={"top-0 bottom-0 left-0 right-0 absolute bg-white "} style={{ zIndex: -5, opacity: 0.7 }}></div>
            <div className={"p-5 w-full bg-red-400 text-center"}>
                dummy component<h3><b>{`ns-${block.namespace}-row-${rowIndex}-i-${componentIndex}`}</b></h3>
            </div>


            <div className="p-5">
                {block.title && <a href="#">
                    {block.title && block.title.key}
                    <h5 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>
                        {block.title && t(block.title).__html}
                    </h5>
                </a>}
                {block.subTitle && block.subTitle.key}
                {block.subTitle && <h6 className={"mb-2 text-xl tracking-tight text-gray-900 dark:text-white"}>
                    {block.subTitle && t(block.subTitle).__html}
                </h6>}

                paragraphs:
                {await Promise.all(block.paragraphs.map(async (p, ip) => renderParagraph(p, ip)))}
                images:
                {block.images.map((img, ii) => {
            return (<div>
                            <p key={"url" + ii} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                                url: {img && img.url && t(img.url).__html}
                                {img.url && <span className={"bg-cover bg-no-repeat"} style={{
                        display: "block",
                        width: "200px",
                        height: "200px",
                        backgroundImage: `url(${t(img.url)})`
                    }}></span>}
                            </p>
                            <p key={"alt" + ii} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                                alt: {img && img.alt && t(img.alt).__html}
                            </p>
                            <p key={"title" + ii} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                                title: {img && img.title && t(img.title).__html}
                            </p>
                        </div>);
        })}
            </div>

            <div className={"absolute bottom-0 p-5"}>
                {block.callToActions.map((cta) => {
            return <p><b>{`${t(cta.ctaTitle || cta.ctaUrl)}: ${t(cta.ctaUrl)}`}</b>{`${cta.ctaUrl.key}: ${t(cta.ctaUrl)}`}</p>;
        })}

            </div>

        </div>);
    function renderParagraph(p, ip) {
        if (p instanceof NdTranslatableText) {
            return (<div>
                    {p && p.key}
                    <p key={ip} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                        {p && t(p).__html}
                    </p>
                </div>);
        }
        else if (p instanceof NdCode) {
            const code = p;
            return (<div className={"border border-gray-200 p-4"}>
                                <pre className={"text-pretty"}>
                                    <code lang={code.lang} className={"hljs"} dangerouslySetInnerHTML={{ __html: code.code }}/>
                                </pre>
                </div>);
        }
        else if (p instanceof NdLink) {
            const link = p;
            return (<div>
                    link
                    <div key={ip} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                        urlText: {link.urlText && showTranslatableText(link.urlText)}
                        url: {showTranslatableText(link.url)}
                    </div>

                </div>);
        }
        else {
            const list = p;
            if (list.ordered) {
                return (<ol className={"list-disc list-outside"}>
                        {list.items.map(i => <li className={"ml-4"}>
                                {showListItem(i)}
                                {i.subList && renderParagraph(i.subList, ip)}
                            </li>)}
                    </ol>);
            }
            else {
                return (<ul className={"list-disc list-outside"}>
                        {list.items.map(i => <li className={"ml-4"}>
                                {showListItem(i)}
                                {i.subList && renderParagraph(i.subList, ip)}
                            </li>)}
                    </ul>);
            }
        }
    }
}
function showTranslatableText(text) {
    return <span>{text.text} <small>(<i>{text.key}</i>)</small></span>;
}
function showListItem(i) {
    return i.text instanceof NdTranslatableText ?
        showTranslatableText(i.text) :
        <span>link item {(i.text.urlText ? showTranslatableText(i.text.urlText) : "link text n/a")} : {showTranslatableText(i.text.url)}</span>;
}
