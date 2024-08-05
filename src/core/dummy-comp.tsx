import {NdContentBlock, NdContentImage, LbTranslatedText} from "../content/nd-content";
import {JSX} from "react";
import {NdSkinComponentProps} from "../skin/nd-skin";

export async function DummyComp(props: NdSkinComponentProps): Promise<JSX.Element> {

    console.log("content dummy comp", props.content)

    const {content, i18nextProvider, lng, rowIndex, componentIndex} = props;

    const {t} = await i18nextProvider(lng);

    const blocks: JSX.Element[] = content.map((block: NdContentBlock) => {

        var style = {};
        if (block.bgImage && block.bgImage.url) {
            style = {backgroundImage: `url(${t(block.bgImage.url.key, block.bgImage.url.ns)})`}
        }

        return (
            <div
                className={"w-full w-full flex flex-col items-left justify-left  border border-4 border-red-200 relative pb-10"}>
                <div className={"top-0 bottom-0 left-0 right-0 absolute bg-cover bg-no-repeat"}
                     style={{...style, zIndex: -11}}>
                </div>
                <div className={"top-0 bottom-0 left-0 right-0 absolute bg-white "} style={{zIndex: -5, opacity: 0.7}}>
                </div>
                <div className={"p-5 w-full bg-red-400 text-center"}>dummy component<h3><b>{`${block.namespace}-row-${rowIndex}-i-${componentIndex}`}</b></h3></div>


                <div className="p-5">
                    {block.title && <a href="#">
                        {block.title && block.title.key}
                        <h5 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>
                            {block.title && t(block.title.key, block.title.ns)}
                        </h5>
                    </a>}
                    {block.subTitle && block.subTitle.key}
                    {block.subTitle && <h6 className={"mb-2 text-xl tracking-tight text-gray-900 dark:text-white"}>
                        {block.subTitle && t(block.subTitle.key, block.subTitle.ns)}
                    </h6>}

                    paragraphs:
                    {block.paragraphs.map((p: LbTranslatedText, ip: number) => {
                        return (
                            <div>
                                {p && p.key}
                                <p key={ip} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                                    {p && t(p.key, p.ns)}
                                </p>
                            </div>
                        )
                    })}
                    images:
                    {block.images.map((i: NdContentImage, ii: number) => {
                        return (
                            <div>
                                <p key={"url" + ii} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                                    url: {i && i.url && t(i.url.key, i.url.ns)}
                                    {i.url && <span className={"bg-cover bg-no-repeat"} style={{
                                        display: "block",
                                        width: "200px",
                                        height: "200px",
                                        backgroundImage: `url(${t(i.url.key, i.url.ns)})`
                                    }}></span>}
                                </p>
                                <p key={"alt" + ii} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                                    alt: {i && i.alt && t(i.alt.key, i.alt.ns)}
                                </p>
                                <p key={"title" + ii} className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                                    title: {i && i.title && t(i.title.key, i.title.ns)}
                                </p>
                            </div>
                        )
                    })}
                </div>

                <div className={"absolute bottom-0 p-5"}>
                    {block.footer?.key}
                    <p>{block.footer && t(block.footer.key, block.footer.ns)}</p>
                </div>

            </div>

        );
    })

    return <div>{blocks}</div>;
}
