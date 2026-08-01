export function cheeselordTheme(options) {
    const stylesheet = `@cheeselord/design/styles/${options.flavor}.css`;
    return {
        name: "@cheeselord/design",
        hooks: {
            "config:setup": ({ updateConfig }) => {
                updateConfig({ customCss: [stylesheet] });
            },
        },
    };
}
