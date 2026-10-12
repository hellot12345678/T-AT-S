from setuptools import setup, find_packages

setup(
    name="t-at-s",
    version="1.0.0",
    author="hellot12345678",
    author_email="hellot12345678@gmail.com",
    description="T@S (Talk. Decide. Solve.) — Universal AI Voice Agent Client SDK for Python & Django",
    long_description=open("README.md", encoding="utf-8").read() if open("README.md", encoding="utf-8") else "",
    long_description_content_type="text/markdown",
    url="https://github.com/hellot12345678/T-AT-S",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Framework :: Django",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.9",
    install_packages_data=True,
    install_requires=[
        "requests>=2.28.0",
    ],
)
