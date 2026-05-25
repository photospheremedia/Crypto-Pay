import { createOpenGraphImage, OPEN_GRAPH_PAGES } from "@/lib/open-graph-pages";

const image = createOpenGraphImage(OPEN_GRAPH_PAGES.about);

export const alt = image.alt;
export const size = image.size;
export const contentType = image.contentType;
export default image.default;
