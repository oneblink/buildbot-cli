# blinkmobile / buildbot-cli

## iOS Buildbot

### Required Files for Signing

iOS applications built using Cordova require two files:

-   Personal Information Exchange: `.p12`
-   Provisioning Profile: `.mobileprovision`

The Personal Information Exchange file must created using an Apple Developer Certificate which can be obtained with a Certificate Signing Request.

#### Certificate Signing Request (CSR)

There are few ways to create this, below are our suggestions:

##### Keychain Access (requires OSX)

During creation of your certificate in [Apple Developer Account](https://developer.apple.com/account/ "Click here to access your Apple Developer Account"),
the second step is gives instructions on how to create a CRS using Keychain Access. Please follow these instructions to generate your CRS.

##### OpenSSL

Use the following command to create a CRS with a private key:

```sh
openssl req -newkey rsa:2048 -keyout path/to/your/private_key.key -out path/to/your/certificate_signing_request.csr
```

#### Certificate & Provisioning Profile

Both of these files can be obtained from your [Apple Developer Account](https://developer.apple.com/account/ "Click here to access your Apple Developer Account").

Once logged in, follow the steps below to obtain both files.

1.  Click the **Certificates, IDs and Profiles** link
2.  Create a new **Certificate** (or use an existing one)
3.  Download certificate
4.  Create a new **App ID** (or use an existing one), found underneath the _Identifiers_ section
5.  Create a new **Provisioning Profile** (or use and existing one), must ensure the provisioning profile uses the App ID you use from step 4 and the certificate you used from step 2
6.  Download provisioning profile

#### Personal Information Exchange: `.p12`

Once you have your certificate generated via your [Apple Developer Account](https://developer.apple.com/account/ "Click here to access your Apple Developer Account"),
you will need to create a `.p12` file to allow your private key and certificate to be transferred to the Buildbot to sign the App with.

We recommend using _Keychain Access_ or _openssl_:

##### Keychain Access (requires OSX)

Follow the steps below:

1.  Double click on your `.cer` file downloaded from your [Apple Developer Account](https://developer.apple.com/account/ "Click here to access your Apple Developer Account"), this will install the certificate into Keychain Access
2.  Right click on the certificate imported and click **Export**
3.  Give the file a name with the `.p12` extension and ensure the file format is **Personal Information Exchange: (.p12)**

##### OpenSSL

Convert Apple Developer Certificate `.cer` file to `.pem` file to allow for `.p12` file to be created:

```sh
openssl x509 -in path/to/your/certificate.cer -inform DER -out path/to/your/certificate.pem -outform PEM
```

Create `.p12` using your private key `.key` (generated with your Certificate Signing Request) and your certificate `.pem` (generated in the previous step):

```sh
openssl pkcs12 -export -inkey path/to/your/private_key.key -in path/to/your/certificate.pem -out path/to/your/ios_development.p12
```

### build.json

With your Provisioning Profile and Personal Information Exchange you can set up your `build.json` file for signing the application. Below are the properties required and a description of each:

Property			    | Description |
------------------------|:-------------|
codeSignIdentity	    |Code signing identity to use for signing.|
provisioningProfile	    |UUID of the provisioning profile to be used for signing. By opening your provisioning profile `.mobileprovision` file in a text editor, you can find the UUID which needs to be specified here. Just search for `UUID`.|
provisioningProfileFile	|A relative path to the Provisioning Profile (`.mobileprovision`) file downloaded from your Apple Developer Account. This file must be included in your Cordova project to be uploaded to the Buildbot.
certificateFile		    |A relative path to the personal information exchange (`.p12`) file created via _Keychain Access_ or _openssl_. This file must be included in your Cordova project to be uploaded to the Buildbot.

#### Example

```json
{
  "ios": {
	"debug": {
      "codeSignIdentity": "iPhone Development",
      "provisioningProfile": "926c2bd6-8de9-4c2f-8407-1016d2d12954",
      "provisioningProfileFile": "Development.mobileprovision",
      "certificateFile": "ios_development.p12"
    },
    "release": {
      "codeSignIdentity": "iPhone Distribution",
      "provisioningProfile": "70f699ad-faf1-4adE-8fea-9d84738fb306",
      "provisioningProfileFile": "Distribution.mobileprovision",
      "certificateFile": "ios_distribution.p12"
    }
  }
}
```

### Cordova Project Id

Lastly the Cordova project id must match the App ID you use in your provisioning profile. The project id can be edited from the `config.xml` file in your Cordova project. It is the `id` attribute of the `widget` tag.

See examples below for App IDs that contain wildcards:

App ID                      |Project Id                    |Valid
----------------------------|------------------------------|-----|
`com.company.firstname.*`   |`com.company.firstname.app1`  |Yes
`com.company.firstname.*`   |`com.company.firstname.app2`  |Yes
`com.company.firstname.*`   |`com.company.appname`         |No
`com.company.firstname.app` |`com.company.firstname.app`   |Yes
