// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
/* eslint-disable @typescript-eslint/no-var-requires */

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "eventual",
  tagline:
    "Build scalable and durable services with APIs, Messaging and Workflows",
  url: "https://docs.eventual.ai",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Functionless", // Usually your GitHub org/user name.
  projectName: "eventual", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          sidebarCollapsed: false,
          sidebarCollapsible: true,
        },
        gtag: {
          trackingID: "G-F04RL3TTNM",
          anonymizeIP: true,
        },
        blog: {
          blogTitle: "Eventual Blog",
          blogDescription: "Blog for EventualAi and EventualCloud",
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        disableSwitch: true,
        defaultMode: "light",
      },
      navbar: {
        title: "",
        logo: {
          alt: "eventual",
          src: "img/logo.svg",
          href: "https://eventual.ai",
          target: "_self",
        },
        items: [
          {
            href: "/",
            label: "Home",
            position: "left",
          },
          {
            type: "docSidebar", // docSidebar
            position: "left",
            sidebarId: "tutorial", // foldername
            label: "Tutorial", // navbar title
          },
          {
            to: "blog",
            label: "Blog",
            position: "left",
          },
          {
            href: "https://github.com/functionless/eventual",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://discord.gg/8hfnTn3QDT",
            label: "Discord",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Getting Started",
                to: "/",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/8hfnTn3QDT",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/EventualAI",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/functionless/eventual",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Functionless, Corp.`,
      },
      metadata: [
        {
          name: "description",
          content:
            "Use natural language and AI to explore and refine your business requirements, then generate and deploy a fully functioning service to the cloud",
        },
        {
          name: "og:description",
          content:
            "Use natural language and AI to explore and refine your business requirements, then generate and deploy a fully functioning service to the cloud",
        },
        {
          name: "twitter:description",
          content:
            "Use natural language and AI to explore and refine your business requirements, then generate and deploy a fully functioning service to the cloud",
        },
        {
          name: "twitter:title",
          content: "eventualAi",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        { name: "keywords", content: "eventual, ai, serverless, iac" },
      ],
      image: "https://i.imgur.com/dVLQ8En.png",
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
