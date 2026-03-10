/**
 * IDML Generator — produces a valid InDesign Markup Language (.idml) package.
 *
 * IDML is an open XML-based format that InDesign CS4+ can open natively via File → Open.
 * The package is a ZIP archive containing:
 *   mimetype                 — plain text, must be first entry, uncompressed
 *   designmap.xml            — package manifest listing all story/spread/style files
 *   Resources/Fonts.xml      — font declarations
 *   Resources/Graphic.xml    — graphic defaults
 *   Resources/Preferences.xml— document preferences (units, page size, margins)
 *   Resources/Styles.xml     — paragraph and character style definitions
 *   MasterSpreads/...        — A-Master spread (running headers, page numbers)
 *   Spreads/...              — first content spread
 *   Stories/Story_main.xml   — the main text story with all chapter content
 *   XML/BackingStory.xml     — required XML backing story
 *   XML/Tags.xml             — XML tag definitions
 */

import JSZip from "jszip";
import type { TypesettingStyle, TrimSize } from "../shared/bibleSpecs";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Chapter {
  title: string;
  paragraphs: string[];
}

export interface IdmlOptions {
  title: string;
  author: string;
  trimSize: TrimSize;
  style: TypesettingStyle;
  chapters: Chapter[];
  frontmatter?: string;
  backmatter?: string;
  /** Include red-letter markup for words of Christ (Bible only) */
  redLetter?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function smartTypographyXml(text: string): string {
  let s = text;
  s = s.replace(/---/g, "\u2014");
  s = s.replace(/--/g, "\u2013");
  s = s.replace(/\.\.\./g, "\u2026");
  s = s.replace(/(^|[\s([\u201C])"/g, "$1\u201C");
  s = s.replace(/"/g, "\u201D");
  s = s.replace(/(^|[\s([\u2018])'/g, "$1\u2018");
  s = s.replace(/'/g, "\u2019");
  return s;
}

function inchesToPoints(inches: number): number {
  return Math.round(inches * 72 * 1000) / 1000;
}

function getFontFamily(style: TypesettingStyle): string {
  return style.fontFamily.replace(/'/g, "").split(",")[0].trim();
}

// ─── XML Builders ─────────────────────────────────────────────────────────────

function buildMimetype(): string {
  return "application/vnd.adobe.indesign-idml-package";
}

function buildDesignMap(opts: IdmlOptions): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Document xmlns="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0"
  Self="d"
  StoryList="ub6"
  Name="${escapeXml(opts.title)}">
  <idPkg:Fonts src="Resources/Fonts.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:Graphic src="Resources/Graphic.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:Preferences src="Resources/Preferences.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:Styles src="Resources/Styles.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:MasterSpread src="MasterSpreads/MasterSpread_ufe4.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:Spread src="Spreads/Spread_ub6.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:Story src="Stories/Story_main.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:BackingStory src="XML/BackingStory.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
  <idPkg:Tags src="XML/Tags.xml" xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"/>
</Document>`;
}

function buildPreferences(opts: IdmlOptions): string {
  const { trimSize, style } = opts;
  const pageW = inchesToPoints(trimSize.widthIn);
  const pageH = inchesToPoints(trimSize.heightIn);
  const marginTop = inchesToPoints(trimSize.marginTopIn);
  const marginBottom = inchesToPoints(trimSize.marginBottomIn);
  const marginInside = inchesToPoints(trimSize.marginInsideIn);
  const marginOutside = inchesToPoints(trimSize.marginOutsideIn);
  const columnCount = style.doubleColumn ? 2 : 1;
  const columnGutter = style.doubleColumn ? 18 : 0;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Preferences xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <DocumentPreference
    PageWidth="${pageW}"
    PageHeight="${pageH}"
    FacingPages="true"
    DocumentBleedTopOffset="9"
    DocumentBleedBottomOffset="9"
    DocumentBleedInsideOrLeftOffset="9"
    DocumentBleedOutsideOrRightOffset="9"
    ColumnCount="${columnCount}"
    ColumnGutter="${columnGutter}"
    MarginsTop="${marginTop}"
    MarginsBottom="${marginBottom}"
    MarginsLeft="${marginInside}"
    MarginsRight="${marginOutside}"
  />
  <MeasurementUnits HorizontalMeasurementUnits="Inches" VerticalMeasurementUnits="Inches"/>
</idPkg:Preferences>`;
}

function buildFonts(opts: IdmlOptions): string {
  const fontFamily = getFontFamily(opts.style);
  const psName = fontFamily.replace(/ /g, "-");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Fonts xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <FontFamily Self="FontFamily/${escapeXml(fontFamily)}" Name="${escapeXml(fontFamily)}">
    <Font Self="Font/${escapeXml(fontFamily)}/Regular" FontFamily="${escapeXml(fontFamily)}" FontStyleName="Regular" PostScriptName="${escapeXml(psName)}-Regular" Status="Installed" FontType="OpenType"/>
    <Font Self="Font/${escapeXml(fontFamily)}/Italic" FontFamily="${escapeXml(fontFamily)}" FontStyleName="Italic" PostScriptName="${escapeXml(psName)}-Italic" Status="Installed" FontType="OpenType"/>
    <Font Self="Font/${escapeXml(fontFamily)}/Bold" FontFamily="${escapeXml(fontFamily)}" FontStyleName="Bold" PostScriptName="${escapeXml(psName)}-Bold" Status="Installed" FontType="OpenType"/>
  </FontFamily>
</idPkg:Fonts>`;
}

function buildGraphic(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Graphic xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <GraphicDefaults/>
</idPkg:Graphic>`;
}

function buildStyles(opts: IdmlOptions): string {
  const fontFamily = getFontFamily(opts.style);
  const fontSize = opts.style.fontSize;
  const leading = Math.round(fontSize * opts.style.lineHeight * 10) / 10;
  const marginTop = inchesToPoints(opts.trimSize.marginTopIn);
  const marginBottom = inchesToPoints(opts.trimSize.marginBottomIn);
  const chapterSize = opts.style.chapterHeadingSize;
  const chapterLeading = Math.round(chapterSize * 1.2 * 10) / 10;
  const indent = Math.round(fontSize * 1.2);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Styles xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <RootParagraphStyleGroup Self="ParagraphStyleGroup/$ID/[Root]">
    <ParagraphStyle Self="ParagraphStyle/Body" Name="Body"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular"
      PointSize="${fontSize}" Leading="${leading}"
      SpaceBefore="0" SpaceAfter="0"
      Justification="FullyJustified" HyphenateLastWord="false"
      KeepFirstLines="3" KeepLastLines="3"/>
    <ParagraphStyle Self="ParagraphStyle/ChapterTitle" Name="Chapter Title"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Bold"
      PointSize="${chapterSize}" Leading="${chapterLeading}"
      SpaceBefore="${marginTop}" SpaceAfter="${Math.round(leading * 0.5)}"
      Justification="CenterAlign"/>
    <ParagraphStyle Self="ParagraphStyle/HalfTitle" Name="Half Title"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular"
      PointSize="${Math.round(chapterSize * 1.2)}" Leading="${Math.round(chapterSize * 1.2 * 1.3 * 10) / 10}"
      SpaceBefore="0" SpaceAfter="0"
      Justification="CenterAlign" KeepWithNext="1"/>
    <ParagraphStyle Self="ParagraphStyle/TitlePage" Name="Title Page"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Bold"
      PointSize="${Math.round(chapterSize * 1.8)}" Leading="${Math.round(chapterSize * 1.8 * 1.2 * 10) / 10}"
      SpaceBefore="0" SpaceAfter="${Math.round(leading * 0.5)}"
      Justification="CenterAlign"/>
    <ParagraphStyle Self="ParagraphStyle/TitleAuthor" Name="Title Author"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular"
      PointSize="${fontSize + 2}" Leading="${Math.round((fontSize + 2) * 1.4 * 10) / 10}"
      SpaceBefore="0" SpaceAfter="0"
      Justification="CenterAlign"/>
    <ParagraphStyle Self="ParagraphStyle/Copyright" Name="Copyright"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular"
      PointSize="${Math.max(fontSize - 2, 7.5)}" Leading="${Math.round(Math.max(fontSize - 2, 7.5) * 1.6 * 10) / 10}"
      SpaceBefore="0" SpaceAfter="${Math.round(leading * 0.15)}"
      Justification="LeftAlign"/>
    <ParagraphStyle Self="ParagraphStyle/ChapterSubtitle" Name="Chapter Subtitle"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Italic"
      PointSize="${chapterSize}" Leading="${chapterLeading}"
      SpaceBefore="0" SpaceAfter="${Math.round(leading * 0.3)}"
      Justification="CenterAlign"/>
    <ParagraphStyle Self="ParagraphStyle/SceneBreak" Name="Scene Break"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular"
      PointSize="${fontSize}" Leading="${leading}"
      SpaceBefore="${Math.round(leading * 0.8)}" SpaceAfter="${Math.round(leading * 0.8)}"
      Justification="CenterAlign"/>
    <ParagraphStyle Self="ParagraphStyle/BodyFirst" Name="Body First"
      BasedOn="ParagraphStyle/Body" FirstLineIndent="0"/>
    <ParagraphStyle Self="ParagraphStyle/BodyIndented" Name="Body Indented"
      BasedOn="ParagraphStyle/Body" FirstLineIndent="${indent}"/>
    <ParagraphStyle Self="ParagraphStyle/DropCap" Name="Drop Cap"
      BasedOn="ParagraphStyle/BodyFirst" DropCapCharacters="1" DropCapLines="3"/>
    <ParagraphStyle Self="ParagraphStyle/RunningHeader" Name="Running Header"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Italic"
      PointSize="${Math.round(fontSize * 0.85 * 10) / 10}"
      Leading="${Math.round(fontSize * 0.85 * 1.3 * 10) / 10}"
      SpaceBefore="0" SpaceAfter="${Math.round(marginBottom * 0.25)}"
      Justification="CenterAlign"/>
    <ParagraphStyle Self="ParagraphStyle/PageNumber" Name="Page Number"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular"
      PointSize="${Math.round(fontSize * 0.85 * 10) / 10}"
      Leading="${Math.round(fontSize * 0.85 * 1.3 * 10) / 10}"
      Justification="CenterAlign"/>
  </RootParagraphStyleGroup>
  <RootCharacterStyleGroup Self="CharacterStyleGroup/$ID/[Root]">
    <CharacterStyle Self="CharacterStyle/VerseNum" Name="Verse Number"
      AppliedFont="${escapeXml(fontFamily)}" FontStyle="Bold"
      PointSize="${Math.round(fontSize * 0.7 * 10) / 10}"
      Position="Superscript"/>
    <CharacterStyle Self="CharacterStyle/RedLetter" Name="Red Letter"
      FillColor="Color/Red"/>
  </RootCharacterStyleGroup>
  <RootObjectStyleGroup Self="ObjectStyleGroup/$ID/[Root]">
    <ObjectStyle Self="ObjectStyle/$ID/[None]" Name="$ID/[None]"/>
    <ObjectStyle Self="ObjectStyle/$ID/[Normal Graphics Frame]" Name="$ID/[Normal Graphics Frame]"/>
    <ObjectStyle Self="ObjectStyle/$ID/[Normal Text Frame]" Name="$ID/[Normal Text Frame]"/>
  </RootObjectStyleGroup>
  <RootTableStyleGroup Self="TableStyleGroup/$ID/[Root]">
    <TableStyle Self="TableStyle/$ID/[Basic Table]" Name="$ID/[Basic Table]"/>
  </RootTableStyleGroup>
  <RootCellStyleGroup Self="CellStyleGroup/$ID/[Root]">
    <CellStyle Self="CellStyle/$ID/[None]" Name="$ID/[None]"/>
  </RootCellStyleGroup>
  <Swatch Self="Color/Red" Name="Red" ColorValue="0 100 100 0" Space="CMYK" ColorType="Process"/>
</idPkg:Styles>`;
}

function buildMasterSpread(opts: IdmlOptions): string {
  const { trimSize, title } = opts;
  const pageW = inchesToPoints(trimSize.widthIn);
  const pageH = inchesToPoints(trimSize.heightIn);
  const headerH = inchesToPoints(trimSize.headerFooterIn);
  const marginTop = inchesToPoints(trimSize.marginTopIn);
  const marginBottom = inchesToPoints(trimSize.marginBottomIn);
  const marginInside = inchesToPoints(trimSize.marginInsideIn);
  const marginOutside = inchesToPoints(trimSize.marginOutsideIn);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:MasterSpread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <MasterSpread Self="ufe4" Name="A-Master" NamePrefix="A" BaseName="A-Master" PageCount="2">
    <Page Self="ufe4_left" Name="A-Master Left"
      GeometricBounds="0 ${-pageW} ${pageH} 0"
      MarginPreference="ufe4_left_mp"/>
    <Page Self="ufe4_right" Name="A-Master Right"
      GeometricBounds="0 0 ${pageH} ${pageW}"
      MarginPreference="ufe4_right_mp"/>
    <TextFrame Self="ufe4_lhdr" ParentStory="ufe4_lhdr_s"
      GeometricBounds="${marginTop - headerH} ${-pageW + marginOutside} ${marginTop} ${-marginInside}">
      <TextFramePreference TextColumnCount="1"/>
    </TextFrame>
    <Story Self="ufe4_lhdr_s">
      <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/RunningHeader">
        <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
          <SpecialCharacter SpecialCharacterType="AutoPageNumber"/>
          <Content>  ${escapeXml(title)}</Content>
        </CharacterStyleRange>
      </ParagraphStyleRange>
    </Story>
    <TextFrame Self="ufe4_rhdr" ParentStory="ufe4_rhdr_s"
      GeometricBounds="${marginTop - headerH} ${marginInside} ${marginTop} ${pageW - marginOutside}">
      <TextFramePreference TextColumnCount="1"/>
    </TextFrame>
    <Story Self="ufe4_rhdr_s">
      <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/RunningHeader">
        <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
          <Content>${escapeXml(title)}  </Content>
          <SpecialCharacter SpecialCharacterType="AutoPageNumber"/>
        </CharacterStyleRange>
      </ParagraphStyleRange>
    </Story>
  </MasterSpread>
</idPkg:MasterSpread>`;
}

function buildSpread(opts: IdmlOptions): string {
  const { trimSize, style } = opts;
  const pageW = inchesToPoints(trimSize.widthIn);
  const pageH = inchesToPoints(trimSize.heightIn);
  const marginTop = inchesToPoints(trimSize.marginTopIn);
  const marginBottom = inchesToPoints(trimSize.marginBottomIn);
  const marginInside = inchesToPoints(trimSize.marginInsideIn);
  const marginOutside = inchesToPoints(trimSize.marginOutsideIn);
  const columnCount = style.doubleColumn ? 2 : 1;
  const columnGutter = style.doubleColumn ? 18 : 0;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Spread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <Spread Self="ub6" PageCount="2" AllowPageShuffle="true"
    FlattenerOverride="Default" AppliedMaster="ufe4">
    <Page Self="ub6_left" Name="2" AppliedMaster="ufe4"
      MasterPageTransform="1 0 0 1 ${-pageW} 0"
      GeometricBounds="0 ${-pageW} ${pageH} 0">
      <MarginPreference ColumnCount="${columnCount}" ColumnGutter="${columnGutter}"
        Top="${marginTop}" Bottom="${marginBottom}"
        Left="${marginOutside}" Right="${marginInside}"/>
    </Page>
    <Page Self="ub6_right" Name="3" AppliedMaster="ufe4"
      MasterPageTransform="1 0 0 1 0 0"
      GeometricBounds="0 0 ${pageH} ${pageW}">
      <MarginPreference ColumnCount="${columnCount}" ColumnGutter="${columnGutter}"
        Top="${marginTop}" Bottom="${marginBottom}"
        Left="${marginInside}" Right="${marginOutside}"/>
    </Page>
    <TextFrame Self="ub6_tf" ParentStory="Story_main"
      GeometricBounds="${marginTop} ${-pageW + marginOutside} ${pageH - marginBottom} ${pageW - marginOutside}">
      <TextFramePreference TextColumnCount="${columnCount}" TextColumnGutter="${columnGutter}"/>
    </TextFrame>
  </Spread>
</idPkg:Spread>`;
}

function buildStory(opts: IdmlOptions): string {
  const { chapters, style } = opts;
  const fontFamily = getFontFamily(style);
  const fontSize = style.fontSize;
  const leading = Math.round(fontSize * style.lineHeight * 10) / 10;
  const SCENE_BREAK_RE = /^(\*\s*\*\s*\*|#\s*#\s*#|~\s*~\s*~|-\s*-\s*-|\u2014\s*\u2014\s*\u2014|\* \* \*|\u00A7)$/;

  let content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Story xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <Story Self="Story_main" AppliedTOCStyle="n" TrackChanges="false"
    StoryTitle="${escapeXml(opts.title)}" AppliedNamedGrid="n">
`;

  const year = new Date().getFullYear();

  content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/HalfTitle">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <Content>${escapeXml(smartTypographyXml(opts.title))}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>
    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Body">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <SpecialCharacter SpecialCharacterType="FrameBreak"/>
      </CharacterStyleRange>
    </ParagraphStyleRange>\n`;

  content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/TitlePage">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        AppliedFont="${escapeXml(fontFamily)}" FontStyle="Bold">
        <Content>${escapeXml(smartTypographyXml(opts.title))}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>
    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/TitleAuthor">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <Content>${escapeXml(smartTypographyXml(opts.author))}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>
    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Body">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <SpecialCharacter SpecialCharacterType="FrameBreak"/>
      </CharacterStyleRange>
    </ParagraphStyleRange>\n`;

  const copyrightLines = [
    smartTypographyXml(opts.title),
    `\u00A9 ${year} ${smartTypographyXml(opts.author)}. All rights reserved.`,
    `No part of this publication may be reproduced, distributed, or transmitted in any form without the prior written permission of the author, except for brief quotations in reviews.`,
    `Published by Easy Book Publishers`,
    `Typeset with Easy Book Publishers \u2014 easybookpublishers.com`,
  ];
  for (const line of copyrightLines) {
    content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Copyright">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <Content>${escapeXml(line)}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;
  }
  content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Body">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <SpecialCharacter SpecialCharacterType="FrameBreak"/>
      </CharacterStyleRange>
    </ParagraphStyleRange>\n`;

  if (opts.frontmatter?.trim()) {
    const fmParagraphs = opts.frontmatter.split(/\n{2,}/).filter(p => p.trim().length > 0);
    for (const fmPara of fmParagraphs) {
      content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/BodyFirst">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular" PointSize="${fontSize}" Leading="${leading}">
        <Content>${escapeXml(smartTypographyXml(fmPara.trim()))}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;
    }
    content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Body">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <SpecialCharacter SpecialCharacterType="FrameBreak"/>
      </CharacterStyleRange>
    </ParagraphStyleRange>\n`;
  }

  for (let ci = 0; ci < chapters.length; ci++) {
    const chapter = chapters[ci];

    content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/ChapterTitle">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        AppliedFont="${escapeXml(fontFamily)}" FontStyle="Bold">
        <Content>${escapeXml(smartTypographyXml(chapter.title))}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;

    for (let i = 0; i < chapter.paragraphs.length; i++) {
      const rawPara = chapter.paragraphs[i];
      const para = smartTypographyXml(rawPara);

      if (SCENE_BREAK_RE.test(rawPara.trim())) {
        content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/SceneBreak">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <Content>\u2042</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;
        continue;
      }

      if (style.verseNumbers) {
        const verseMatch = rawPara.match(/^\^(\d+)\s*([\s\S]*)/);
        if (verseMatch) {
          const verseNum = verseMatch[1];
          const verseText = smartTypographyXml(verseMatch[2]);
          const styleRef = i === 0 ? "ParagraphStyle/BodyFirst" : "ParagraphStyle/BodyIndented";
          content += `    <ParagraphStyleRange AppliedParagraphStyle="${styleRef}">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/VerseNum">
        <Content>${escapeXml(verseNum)}</Content>
      </CharacterStyleRange>
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular" PointSize="${fontSize}" Leading="${leading}">
        <Content> ${escapeXml(verseText)}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;
          continue;
        }
      }

      let styleRef: string;
      if (i === 0 && ci === 0 && style.dropCap) {
        styleRef = "ParagraphStyle/DropCap";
      } else if (i === 0) {
        styleRef = "ParagraphStyle/BodyFirst";
      } else {
        styleRef = "ParagraphStyle/BodyIndented";
      }

      content += `    <ParagraphStyleRange AppliedParagraphStyle="${styleRef}">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular" PointSize="${fontSize}" Leading="${leading}">
        <Content>${escapeXml(para)}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;
    }
  }

  if (opts.backmatter?.trim()) {
    content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/Body">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
        <SpecialCharacter SpecialCharacterType="FrameBreak"/>
      </CharacterStyleRange>
    </ParagraphStyleRange>\n`;
    content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/ChapterTitle">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        AppliedFont="${escapeXml(fontFamily)}" FontStyle="Bold">
        <Content>Acknowledgements</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;
    const bmParagraphs = opts.backmatter.split(/\n{2,}/).filter(p => p.trim().length > 0);
    for (const bmPara of bmParagraphs) {
      content += `    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/BodyFirst">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        AppliedFont="${escapeXml(fontFamily)}" FontStyle="Regular" PointSize="${fontSize}" Leading="${leading}">
        <Content>${escapeXml(smartTypographyXml(bmPara.trim()))}</Content>
      </CharacterStyleRange>
      <Br/>
    </ParagraphStyleRange>\n`;
    }
  }

  content += `  </Story>
</idPkg:Story>`;
  return content;
}

function buildBackingStory(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:BackingStory xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <XmlStory Self="di2" TrackChanges="false" StoryTitle="$ID/" AppliedTOCStyle="n"
    AppliedNamedGrid="n">
    <ParagraphStyleRange>
      <CharacterStyleRange>
        <XMLElement Self="di2i" MarkupTag="XMLTag/Root"/>
      </CharacterStyleRange>
    </ParagraphStyleRange>
  </XmlStory>
</idPkg:BackingStory>`;
}

function buildTags(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Tags xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="18.0">
  <XMLTag Self="XMLTag/Root" Name="Root" Color="Color/Black"/>
</idPkg:Tags>`;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Generates a complete IDML package as a Buffer.
 * The buffer can be uploaded to S3 and saved as a .idml file.
 * Open in Adobe InDesign CS4 or later via File → Open.
 */
export async function generateIdml(opts: IdmlOptions): Promise<Buffer> {
  const zip = new JSZip();

  // mimetype MUST be first and stored uncompressed per IDML spec
  zip.file("mimetype", buildMimetype(), { compression: "STORE" });

  zip.file("designmap.xml", buildDesignMap(opts));
  zip.file("Resources/Preferences.xml", buildPreferences(opts));
  zip.file("Resources/Fonts.xml", buildFonts(opts));
  zip.file("Resources/Graphic.xml", buildGraphic());
  zip.file("Resources/Styles.xml", buildStyles(opts));
  zip.file("MasterSpreads/MasterSpread_ufe4.xml", buildMasterSpread(opts));
  zip.file("Spreads/Spread_ub6.xml", buildSpread(opts));
  zip.file("Stories/Story_main.xml", buildStory(opts));
  zip.file("XML/BackingStory.xml", buildBackingStory());
  zip.file("XML/Tags.xml", buildTags());

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return buffer;
}
