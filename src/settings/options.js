function get_options() {
    return {
        format: 'A4',
        margin: { top: '7cm', right: '2cm', bottom: '2cm', left: '2cm' },
        scale: 1,
        landscape: false,
        displayHeaderFooter: true,
        headerTemplate: '',
        footerTemplate: `<html>
            <head><style>html, body { font-size: 12px; }</style></head>
            <body><div style="text-align: right; width: 100%; padding: 0cm 1cm"><span class="pageNumber"></span></div></body>
            </html>`
    }
}
//<div style="width: 100%; text-align: right;">Page&nbsp;<span class="pageNumber"></span>&nbsp;of&nbsp;<span class="totalPages"></span></div>
module.exports.get_options = get_options