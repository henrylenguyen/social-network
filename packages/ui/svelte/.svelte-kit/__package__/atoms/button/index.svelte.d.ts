import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
        size?: "sm" | "md" | "lg";
        isLoading?: boolean;
        leftIcon?: boolean;
        rightIcon?: boolean;
        fullWidth?: boolean;
        disabled?: boolean;
        type?: string;
    };
    events: {
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        'left-icon': {};
        default: {};
        'right-icon': {};
    };
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type IndexProps = typeof __propDef.props;
export type IndexEvents = typeof __propDef.events;
export type IndexSlots = typeof __propDef.slots;
export default class Index extends SvelteComponent<IndexProps, IndexEvents, IndexSlots> {
}
export {};
//# sourceMappingURL=index.svelte.d.ts.map