import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava

description = "Scramble quality checker that performs statistical analyses"

attachRemoteRepositories()

plugins {
    java
    application
}

configureJava()

dependencies {
    implementation(project(":scrambles"))
    implementation("org.apache.commons:commons-math3:3.6.1")
}

application {
    mainClassName = "org.thewca.scrambleanalysis.App"
}
