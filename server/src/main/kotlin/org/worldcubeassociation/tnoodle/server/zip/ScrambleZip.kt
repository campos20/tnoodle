package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.zip.model.dsl.zipArchive
import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.toFileSafeString
import java.time.LocalDateTime
import java.util.*

data class ScrambleZip(
    val wcif: Competition,
    val namedSheets: Map<String, ScrambleSheet>,
    val fmcTranslations: List<Locale>,
    val watermark: String?
) {
    private val globalTitle get() = wcif.shortName

    fun assemble(
        generationDate: LocalDateTime,
        versionTag: String,
        pdfPassword: String?,
        generationUrl: String?
    ): ZipArchive {
        val computerDisplayZip = ComputerDisplayZip(namedSheets, globalTitle)
        val computerDisplayZipBytes = computerDisplayZip.assemble()

        val interchangeFolder = InterchangeFolder(wcif, namedSheets, globalTitle)
        val interchangeFolderNode =
            interchangeFolder.assemble(generationDate, versionTag, generationUrl)

        val printingFolder = PrintingFolder(wcif, namedSheets, fmcTranslations, watermark)
        val printingFolderNode = printingFolder.assemble(pdfPassword)


        val resourceTemplate = this::class.java.getResourceAsStream(TXT_PASSCODE_TEMPLATE)
            .bufferedReader().readText()
            .replace("%%GLOBAL_TITLE%%", globalTitle)

        val passcodeList = computerDisplayZip.passcodes.entries
            .joinToString("\r\n") { "${it.key}: ${it.value.passcode}" }

        val passcodeListingTxt = resourceTemplate.replace("%%PASSCODES%%", passcodeList)

        // This sorts passwords so delegates can linearly read them.
        // This is inspired by https://github.com/simonkellly/scramble-organizer
        // which may become deprecated after this so we are giving credit here.

        val passcodesOrdered = wcif.schedule.activitiesWithLocalStartTimes.entries
            .sortedBy { it.value }
            .map {
                computerDisplayZip.passcodes.entries.find { e ->
                    e.value.activityCode?.activityCodeString == it.key.activityCode.activityCodeString
                        || e.value.activityCode?.activityCodeString?.replace(
                        // When the event has attempts split (eg FMC) or only one group,
                        // activityCodeString hide the -g1, but it is still present in the activityCode.
                        "-g1",
                        ""
                    ) == it.key.activityCode.activityCodeString
                }?.value
            }
            .distinct()

        val orderedPasscodeList = passcodesOrdered
            .filterNotNull()
            .joinToString("\r\n") { "${it.title}: ${it.passcode}" }

        val orderedPasscodeListingTxt =
            resourceTemplate.replace("%%PASSCODES%%", orderedPasscodeList)

        val filesafeGlobalTitle = globalTitle.toFileSafeString()

        return zipArchive {
            folder(printingFolderNode)
            folder(interchangeFolderNode)

            file(
                "$filesafeGlobalTitle - Computer Display PDFs.zip",
                computerDisplayZipBytes.compress()
            )
            file(
                "$filesafeGlobalTitle - Computer Display PDF Passcodes - SECRET.txt",
                passcodeListingTxt
            )
            file(
                "$filesafeGlobalTitle - Ordered Computer Display PDF Passcodes - SECRET.txt",
                orderedPasscodeListingTxt
            )
        }
    }

    companion object {
        private val TXT_PASSCODE_TEMPLATE = "/text/passcodeTemplate.txt"
    }
}
