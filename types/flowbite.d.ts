// The installed flowbite package ships without type definitions; declare the
// one function the app uses (components/FlowbiteInitializer.tsx).
declare module 'flowbite' {
    export function initFlowbite(): void;
}
